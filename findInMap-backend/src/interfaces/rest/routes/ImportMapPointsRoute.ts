import ImportMapPointsDto from "../../../core/dtos/ImportMapPointsDto";
import ImportMapPointsResultDto from "../../../core/dtos/ImportMapPointsResultDto";
import ImportMapPointsFromFile from "../../../core/usecases/ImportMapPointsFromFile";
import Route from "../Route";
import getImportMapPointsResultSchema from "../schemas/getImportMapPointsResultSchema";
import { auhtorizationParam } from "./common/authorizationParam";

interface ReqParams {
    groupId: string;
    mapId: string;
}

export default (
    importMapPointsFromFile: ImportMapPointsFromFile,
): Route<ReqParams, void, ImportMapPointsDto, ImportMapPointsResultDto> => ({
    path: "/:groupId/maps/:mapId/points/import",
    method: "post",
    operationObject: {
        tags: ["maps"],
        summary: "Import map points from Excel/CSV file",
        description:
            "Import multiple map points from an Excel (.xlsx) or CSV file encoded as base64. " +
            "Required columns: description, latitude, longitude. " +
            "Optional columns: date (defaults to today), dueDate, notes, category (matched by name).",
        parameters: [
            auhtorizationParam,
            {
                name: "groupId",
                in: "path",
                required: true,
                schema: { type: "string" },
            },
            {
                name: "mapId",
                in: "path",
                required: true,
                schema: { type: "string" },
            },
        ],
        requestBody: {
            required: true,
            content: {
                "application/json": {
                    schema: {
                        type: "object",
                        required: ["file"],
                        properties: {
                            file: {
                                type: "object",
                                required: ["name", "content"],
                                properties: {
                                    name: {
                                        type: "string",
                                        description:
                                            "Original file name (e.g., points.xlsx or points.csv)",
                                    },
                                    content: {
                                        type: "string",
                                        description:
                                            "Base64 encoded file content",
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        responses: {
            200: {
                description: "Import completed with results",
                content: {
                    "application/json": {
                        schema: getImportMapPointsResultSchema(),
                    },
                },
            },
            400: {
                description: "Bad request - invalid file or data",
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                success: { type: "boolean" },
                                error: { type: "string" },
                            },
                        },
                    },
                },
            },
            403: {
                description:
                    "Forbidden - User does not have access to this map",
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                success: { type: "boolean" },
                                error: { type: "string" },
                            },
                        },
                    },
                },
            },
            500: {
                description: "Internal server error",
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                success: { type: "boolean" },
                                error: { type: "string" },
                            },
                        },
                    },
                },
            },
        },
    },
    handler: async (req, res) => {
        const userId = (req as any).user!.userId;
        const groupId = req.params.groupId;
        const mapId = req.params.mapId;

        const result = await importMapPointsFromFile.exec(
            req.body,
            userId,
            groupId,
            mapId,
        );

        res.status(200).json(result);
    },
});
