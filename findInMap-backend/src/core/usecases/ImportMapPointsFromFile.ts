import { format, isValid, parse } from "date-fns";
import * as XLSX from "xlsx";

import GroupRepository from "../dependencies/GroupRepository";
import MapRepository from "../dependencies/MapRepository";
import CreateMapPointDto from "../dtos/CreateMapPointDto";
import ImportMapPointsDto from "../dtos/ImportMapPointsDto";
import ImportMapPointsResultDto, {
    ImportRowError,
} from "../dtos/ImportMapPointsResultDto";
import { makeMapPointDto } from "../dtos/MapPointDto";
import NotAllowedActionError from "../errors/NotAllowedActionError";

const MAX_ROWS = 1000;
const DATE_FORMATS = ["yyyy-MM-dd", "dd/MM/yyyy", "d/M/yyyy"];

interface RawRow {
    description?: string;
    latitude?: number;
    longitude?: number;
    date?: string;
    duedate?: string;
    notes?: string;
    category?: string;
}

function normalizeHeadersInRow(row: Record<string, unknown>): RawRow {
    const normalized: Record<string, unknown> = {};
    for (const key of Object.keys(row)) {
        normalized[key.toLowerCase().trim()] = row[key];
    }
    return normalized as RawRow;
}

function parseDate(value: unknown): string | null {
    if (!value) return null;

    if (value instanceof Date && isValid(value)) {
        return format(value, "yyyy-MM-dd");
    }

    const strValue = String(value).trim();
    if (!strValue) return null;

    for (const fmt of DATE_FORMATS) {
        const parsed = parse(strValue, fmt, new Date());
        if (isValid(parsed)) {
            return format(parsed, "yyyy-MM-dd");
        }
    }

    return null;
}

export default class ImportMapPointsFromFile {
    constructor(
        private groupRepository: GroupRepository,
        private mapRepository: MapRepository,
    ) {}

    async exec(
        data: ImportMapPointsDto,
        userId: string,
        groupId: string,
        mapId: string,
    ): Promise<ImportMapPointsResultDto> {
        const groups = await this.groupRepository.memoizedFindByUserId(userId);
        if (groups.find((group) => group.group.id === groupId) === undefined) {
            throw new NotAllowedActionError(
                "User cannot access map for this group",
            );
        }

        const maps = await this.mapRepository.memoizedFindMapByGroupId(groupId);
        if (maps.find((map) => map.id === mapId) === undefined) {
            throw new NotAllowedActionError(
                "This group has no access to the specified map",
            );
        }

        const fileBuffer = Buffer.from(data.file.content, "base64");
        const workbook = XLSX.read(fileBuffer, {
            type: "buffer",
            cellDates: true,
        });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);

        if (rows.length > MAX_ROWS) {
            throw new NotAllowedActionError(
                `File contains ${rows.length} rows, maximum allowed is ${MAX_ROWS}`,
            );
        }

        const categories =
            await this.mapRepository.memoizedFindCategoriesByMapId(mapId);
        const categoryMap = new Map(
            categories.map((cat) => [cat.description.toLowerCase(), cat.id]),
        );

        const validPoints: CreateMapPointDto[] = [];
        const errors: ImportRowError[] = [];

        rows.forEach((rawRow, index) => {
            // Warning: rowNumber is 1-based and includes header row
            const rowNumber = index + 2;
            const row = normalizeHeadersInRow(rawRow);

            if (
                row.description === undefined ||
                row.description === null ||
                String(row.description).trim() === ""
            ) {
                errors.push({
                    row: rowNumber,
                    error: "Missing required field: description",
                });
                return;
            }

            if (row.latitude === undefined || row.latitude === null) {
                errors.push({
                    row: rowNumber,
                    error: "Missing required field: latitude",
                });
                return;
            }

            if (row.longitude === undefined || row.longitude === null) {
                errors.push({
                    row: rowNumber,
                    error: "Missing required field: longitude",
                });
                return;
            }

            const lat = Number(row.latitude);
            const long = Number(row.longitude);

            if (isNaN(lat) || lat < -90 || lat > 90) {
                errors.push({
                    row: rowNumber,
                    error: `Invalid latitude: ${row.latitude}. Must be between -90 and 90`,
                });
                return;
            }

            if (isNaN(long) || long < -180 || long > 180) {
                errors.push({
                    row: rowNumber,
                    error: `Invalid longitude: ${row.longitude}. Must be between -180 and 180`,
                });
                return;
            }

            const date =
                parseDate(row.date) ?? new Date().toISOString().split("T")[0];
            const dueDate = parseDate(row.duedate) ?? undefined;

            let categoryId: string | undefined;
            if (row.category) {
                const categoryName = String(row.category).toLowerCase().trim();
                categoryId = categoryMap.get(categoryName);
            }

            validPoints.push({
                description: String(row.description).trim(),
                lat,
                long,
                date,
                dueDate,
                notes: row.notes ? String(row.notes).trim() : undefined,
                categoryId,
            });
        });

        const createdPoints = await this.mapRepository.createMapPoints(
            validPoints,
            mapId,
        );

        return {
            imported: createdPoints.map(makeMapPointDto),
            errors,
            totalRows: rows.length,
            successCount: createdPoints.length,
            errorCount: errors.length,
        };
    }
}
