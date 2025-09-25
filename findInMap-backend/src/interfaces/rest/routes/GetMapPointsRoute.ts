import { MapPointDto } from "../../../core/dtos/MapPointDto";
import GetMapPoints from "../../../core/usecases/GetMapPoints";
import Route from "../Route";
import getMapPointSchema from "../schemas/getMapPointSchema";

export default (
    getMapPoints: GetMapPoints,
): Route<void, void, void, MapPointDto[]> => ({
    path: "/api/map-points",
    method: "get",
    operationObject: {
        tags: ["map-points"],
        summary: "Get all map points",
        description: "Retrieve all map points from the database",
        responses: {
            200: {
                description: "List of map points",
                content: {
                    "application/json": {
                        schema: {
                            type: "array",
                            items: getMapPointSchema(),
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
    handler: async (_req, res) => {
        const mapPoints = await getMapPoints.exec();

        res.status(200).json(mapPoints);
    },
});
