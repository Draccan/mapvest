import * as XLSX from "xlsx";

import { UserGroupRole } from "../../../src/core/commons/enums";
import { MapPointEntity } from "../../../src/core/entities/MapPointEntity";
import NotAllowedActionError from "../../../src/core/errors/NotAllowedActionError";
import ImportMapPointsFromFile from "../../../src/core/usecases/ImportMapPointsFromFile";
import { mockGroupRepository, mockMapRepository } from "../../helpers";

function createExcelBase64(data: Record<string, unknown>[]): string {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
    return buffer.toString("base64");
}

describe("ImportMapPointsFromFile", () => {
    let importMapPointsFromFile: ImportMapPointsFromFile;
    const mockDate = new Date("2025-10-02T00:00:00.000Z");
    const userId = "user-id-123";
    const groupId = "group-id-456";
    const mapId = "map-id-789";
    const categoryId = "category-id-001";

    beforeEach(() => {
        jest.clearAllMocks();
        importMapPointsFromFile = new ImportMapPointsFromFile(
            mockGroupRepository,
            mockMapRepository,
        );

        mockGroupRepository.memoizedFindByUserId.mockResolvedValue([
            {
                group: {
                    id: groupId,
                    name: "Test Group",
                    createdBy: userId,
                    createdAt: mockDate,
                    updatedAt: mockDate,
                    planName: null,
                    planEndDate: null,
                },
                role: UserGroupRole.Admin,
            },
        ]);

        mockMapRepository.memoizedFindMapByGroupId.mockResolvedValue([
            {
                id: mapId,
                groupId: groupId,
                name: "Test Map",
                isPublic: false,
                publicId: null,
            },
        ]);

        mockMapRepository.memoizedFindCategoriesByMapId.mockResolvedValue([
            {
                id: categoryId,
                map_id: mapId,
                description: "Test Category",
                color: "#FF0000",
                created_at: mockDate,
                updated_at: mockDate,
            },
        ]);
    });

    describe("exec", () => {
        it("should successfully import valid points from Excel file", async () => {
            const excelData = [
                {
                    description: "Point 1",
                    latitude: 45.4642,
                    longitude: 9.19,
                    date: "2025-12-03",
                },
                {
                    description: "Point 2",
                    latitude: 41.9028,
                    longitude: 12.4964,
                    date: "2025-12-04",
                },
            ];

            const fileContent = createExcelBase64(excelData);

            const mockCreatedPoints: MapPointEntity[] = [
                {
                    id: "point-1",
                    long: 9.19,
                    lat: 45.4642,
                    description: "Point 1",
                    date: "2025-12-03",
                    created_at: mockDate,
                    updated_at: mockDate,
                },
                {
                    id: "point-2",
                    long: 12.4964,
                    lat: 41.9028,
                    description: "Point 2",
                    date: "2025-12-04",
                    created_at: mockDate,
                    updated_at: mockDate,
                },
            ];

            mockMapRepository.createMapPoints.mockResolvedValue(
                mockCreatedPoints,
            );

            const result = await importMapPointsFromFile.exec(
                { file: { name: "test.xlsx", content: fileContent } },
                userId,
                groupId,
                mapId,
            );

            expect(result.totalRows).toBe(2);
            expect(result.successCount).toBe(2);
            expect(result.errorCount).toBe(0);
            expect(result.imported).toHaveLength(2);
            expect(result.errors).toHaveLength(0);
            expect(mockMapRepository.createMapPoints).toHaveBeenCalledWith(
                expect.arrayContaining([
                    expect.objectContaining({
                        description: "Point 1",
                        lat: 45.4642,
                        long: 9.19,
                    }),
                    expect.objectContaining({
                        description: "Point 2",
                        lat: 41.9028,
                        long: 12.4964,
                    }),
                ]),
                mapId,
            );
        });

        it("should match category by name case-insensitively", async () => {
            const excelData = [
                {
                    description: "Categorized Point",
                    latitude: 45.4642,
                    longitude: 9.19,
                    category: "test category",
                },
            ];

            const fileContent = createExcelBase64(excelData);

            const mockCreatedPoints: MapPointEntity[] = [
                {
                    id: "point-1",
                    long: 9.19,
                    lat: 45.4642,
                    description: "Categorized Point",
                    date: new Date().toISOString().split("T")[0],
                    category_id: categoryId,
                    created_at: mockDate,
                    updated_at: mockDate,
                },
            ];

            mockMapRepository.createMapPoints.mockResolvedValue(
                mockCreatedPoints,
            );

            await importMapPointsFromFile.exec(
                { file: { name: "test.xlsx", content: fileContent } },
                userId,
                groupId,
                mapId,
            );

            expect(mockMapRepository.createMapPoints).toHaveBeenCalledWith(
                expect.arrayContaining([
                    expect.objectContaining({
                        categoryId: categoryId,
                    }),
                ]),
                mapId,
            );
        });

        it("should use today date when date is missing", async () => {
            const excelData = [
                {
                    description: "No Date Point",
                    latitude: 45.4642,
                    longitude: 9.19,
                },
            ];

            const fileContent = createExcelBase64(excelData);
            const today = new Date().toISOString().split("T")[0];

            const mockCreatedPoints: MapPointEntity[] = [
                {
                    id: "point-1",
                    long: 9.19,
                    lat: 45.4642,
                    description: "No Date Point",
                    date: today,
                    created_at: mockDate,
                    updated_at: mockDate,
                },
            ];

            mockMapRepository.createMapPoints.mockResolvedValue(
                mockCreatedPoints,
            );

            await importMapPointsFromFile.exec(
                { file: { name: "test.xlsx", content: fileContent } },
                userId,
                groupId,
                mapId,
            );

            expect(mockMapRepository.createMapPoints).toHaveBeenCalledWith(
                expect.arrayContaining([
                    expect.objectContaining({
                        date: today,
                    }),
                ]),
                mapId,
            );
        });

        it("should parse DD/MM/YYYY date format", async () => {
            const excelData = [
                {
                    description: "EU Date",
                    latitude: 45.4642,
                    longitude: 9.19,
                    date: "25/12/2025",
                },
            ];

            const fileContent = createExcelBase64(excelData);

            const mockCreatedPoints: MapPointEntity[] = [
                {
                    id: "point-1",
                    long: 9.19,
                    lat: 45.4642,
                    description: "EU Date",
                    date: "2025-12-25",
                    created_at: mockDate,
                    updated_at: mockDate,
                },
            ];

            mockMapRepository.createMapPoints.mockResolvedValue(
                mockCreatedPoints,
            );

            await importMapPointsFromFile.exec(
                { file: { name: "test.xlsx", content: fileContent } },
                userId,
                groupId,
                mapId,
            );

            expect(mockMapRepository.createMapPoints).toHaveBeenCalledWith(
                expect.arrayContaining([
                    expect.objectContaining({
                        date: "2025-12-25",
                    }),
                ]),
                mapId,
            );
        });

        it("should report errors for rows with missing description", async () => {
            const excelData = [
                {
                    description: "Valid Point",
                    latitude: 45.4642,
                    longitude: 9.19,
                },
                {
                    description: "",
                    latitude: 45.4642,
                    longitude: 9.19,
                },
            ];

            const fileContent = createExcelBase64(excelData);

            const mockCreatedPoints: MapPointEntity[] = [
                {
                    id: "point-1",
                    long: 9.19,
                    lat: 45.4642,
                    description: "Valid Point",
                    date: new Date().toISOString().split("T")[0],
                    created_at: mockDate,
                    updated_at: mockDate,
                },
            ];

            mockMapRepository.createMapPoints.mockResolvedValue(
                mockCreatedPoints,
            );

            const result = await importMapPointsFromFile.exec(
                { file: { name: "test.xlsx", content: fileContent } },
                userId,
                groupId,
                mapId,
            );

            expect(result.totalRows).toBe(2);
            expect(result.successCount).toBe(1);
            expect(result.errorCount).toBe(1);
            expect(result.errors[0].row).toBe(3);
            expect(result.errors[0].error).toContain("description");
        });

        it("should report errors for rows with missing latitude", async () => {
            const excelData = [
                {
                    description: "Missing Lat",
                    longitude: 9.19,
                },
            ];

            const fileContent = createExcelBase64(excelData);

            mockMapRepository.createMapPoints.mockResolvedValue([]);

            const result = await importMapPointsFromFile.exec(
                { file: { name: "test.xlsx", content: fileContent } },
                userId,
                groupId,
                mapId,
            );

            expect(result.errorCount).toBe(1);
            expect(result.errors[0].error).toContain("latitude");
        });

        it("should report errors for rows with missing longitude", async () => {
            const excelData = [
                {
                    description: "Missing Long",
                    latitude: 45.4642,
                },
            ];

            const fileContent = createExcelBase64(excelData);

            mockMapRepository.createMapPoints.mockResolvedValue([]);

            const result = await importMapPointsFromFile.exec(
                { file: { name: "test.xlsx", content: fileContent } },
                userId,
                groupId,
                mapId,
            );

            expect(result.errorCount).toBe(1);
            expect(result.errors[0].error).toContain("longitude");
        });

        it("should report errors for rows with invalid latitude", async () => {
            const excelData = [
                {
                    description: "Invalid Lat",
                    latitude: 999,
                    longitude: 9.19,
                },
            ];

            const fileContent = createExcelBase64(excelData);

            mockMapRepository.createMapPoints.mockResolvedValue([]);

            const result = await importMapPointsFromFile.exec(
                { file: { name: "test.xlsx", content: fileContent } },
                userId,
                groupId,
                mapId,
            );

            expect(result.errorCount).toBe(1);
            expect(result.errors[0].error).toContain("latitude");
            expect(result.errors[0].error).toContain("-90");
            expect(result.errors[0].error).toContain("90");
        });

        it("should report errors for rows with invalid longitude", async () => {
            const excelData = [
                {
                    description: "Invalid Long",
                    latitude: 45.4642,
                    longitude: 999,
                },
            ];

            const fileContent = createExcelBase64(excelData);

            mockMapRepository.createMapPoints.mockResolvedValue([]);

            const result = await importMapPointsFromFile.exec(
                { file: { name: "test.xlsx", content: fileContent } },
                userId,
                groupId,
                mapId,
            );

            expect(result.errorCount).toBe(1);
            expect(result.errors[0].error).toContain("longitude");
            expect(result.errors[0].error).toContain("-180");
            expect(result.errors[0].error).toContain("180");
        });

        it("should handle case-insensitive headers", async () => {
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.aoa_to_sheet([
                ["DESCRIPTION", "Latitude", "LONGITUDE"],
                ["Test Point", 45.4642, 9.19],
            ]);
            XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
            const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
            const fileContent = buffer.toString("base64");

            const mockCreatedPoints: MapPointEntity[] = [
                {
                    id: "point-1",
                    long: 9.19,
                    lat: 45.4642,
                    description: "Test Point",
                    date: new Date().toISOString().split("T")[0],
                    created_at: mockDate,
                    updated_at: mockDate,
                },
            ];

            mockMapRepository.createMapPoints.mockResolvedValue(
                mockCreatedPoints,
            );

            const result = await importMapPointsFromFile.exec(
                { file: { name: "test.xlsx", content: fileContent } },
                userId,
                groupId,
                mapId,
            );

            expect(result.successCount).toBe(1);
            expect(mockMapRepository.createMapPoints).toHaveBeenCalledWith(
                expect.arrayContaining([
                    expect.objectContaining({
                        description: "Test Point",
                    }),
                ]),
                mapId,
            );
        });

        it("should import with dueDate and notes", async () => {
            const excelData = [
                {
                    description: "Full Point",
                    latitude: 45.4642,
                    longitude: 9.19,
                    date: "2025-12-01",
                    dueDate: "2025-12-31",
                    notes: "Some notes",
                },
            ];

            const fileContent = createExcelBase64(excelData);

            const mockCreatedPoints: MapPointEntity[] = [
                {
                    id: "point-1",
                    long: 9.19,
                    lat: 45.4642,
                    description: "Full Point",
                    date: "2025-12-01",
                    due_date: "2025-12-31",
                    notes: "Some notes",
                    created_at: mockDate,
                    updated_at: mockDate,
                },
            ];

            mockMapRepository.createMapPoints.mockResolvedValue(
                mockCreatedPoints,
            );

            await importMapPointsFromFile.exec(
                { file: { name: "test.xlsx", content: fileContent } },
                userId,
                groupId,
                mapId,
            );

            expect(mockMapRepository.createMapPoints).toHaveBeenCalledWith(
                expect.arrayContaining([
                    expect.objectContaining({
                        dueDate: "2025-12-31",
                        notes: "Some notes",
                    }),
                ]),
                mapId,
            );
        });

        it("should throw NotAllowedActionError when user does not belong to group", async () => {
            mockGroupRepository.memoizedFindByUserId.mockResolvedValue([]);

            const excelData = [
                {
                    description: "Test",
                    latitude: 45,
                    longitude: 9,
                },
            ];

            const fileContent = createExcelBase64(excelData);

            await expect(
                importMapPointsFromFile.exec(
                    { file: { name: "test.xlsx", content: fileContent } },
                    userId,
                    groupId,
                    mapId,
                ),
            ).rejects.toThrow(NotAllowedActionError);
        });

        it("should throw NotAllowedActionError when group does not have access to map", async () => {
            mockMapRepository.memoizedFindMapByGroupId.mockResolvedValue([]);

            const excelData = [
                {
                    description: "Test",
                    latitude: 45,
                    longitude: 9,
                },
            ];

            const fileContent = createExcelBase64(excelData);

            await expect(
                importMapPointsFromFile.exec(
                    { file: { name: "test.xlsx", content: fileContent } },
                    userId,
                    groupId,
                    mapId,
                ),
            ).rejects.toThrow(NotAllowedActionError);
        });

        it("should throw NotAllowedActionError when file exceeds max rows", async () => {
            const excelData = Array.from({ length: 1001 }, (_, i) => ({
                description: `Point ${i}`,
                latitude: 45,
                longitude: 9,
            }));

            const fileContent = createExcelBase64(excelData);

            await expect(
                importMapPointsFromFile.exec(
                    { file: { name: "test.xlsx", content: fileContent } },
                    userId,
                    groupId,
                    mapId,
                ),
            ).rejects.toThrow(NotAllowedActionError);
        });

        it("should return empty imported array when all rows are invalid", async () => {
            const excelData = [
                {
                    description: "",
                    latitude: 45.4642,
                    longitude: 9.19,
                },
                {
                    description: "Missing coords",
                },
            ];

            const fileContent = createExcelBase64(excelData);

            mockMapRepository.createMapPoints.mockResolvedValue([]);

            const result = await importMapPointsFromFile.exec(
                { file: { name: "test.xlsx", content: fileContent } },
                userId,
                groupId,
                mapId,
            );

            expect(result.totalRows).toBe(2);
            expect(result.successCount).toBe(0);
            expect(result.errorCount).toBe(2);
            expect(result.imported).toHaveLength(0);
        });

        it("should ignore unknown category names", async () => {
            const excelData = [
                {
                    description: "Unknown Category Point",
                    latitude: 45.4642,
                    longitude: 9.19,
                    category: "Non Existent Category",
                },
            ];

            const fileContent = createExcelBase64(excelData);

            const mockCreatedPoints: MapPointEntity[] = [
                {
                    id: "point-1",
                    long: 9.19,
                    lat: 45.4642,
                    description: "Unknown Category Point",
                    date: new Date().toISOString().split("T")[0],
                    created_at: mockDate,
                    updated_at: mockDate,
                },
            ];

            mockMapRepository.createMapPoints.mockResolvedValue(
                mockCreatedPoints,
            );

            const result = await importMapPointsFromFile.exec(
                { file: { name: "test.xlsx", content: fileContent } },
                userId,
                groupId,
                mapId,
            );

            expect(result.successCount).toBe(1);
            expect(mockMapRepository.createMapPoints).toHaveBeenCalledWith(
                expect.arrayContaining([
                    expect.objectContaining({
                        categoryId: undefined,
                    }),
                ]),
                mapId,
            );
        });
    });
});
