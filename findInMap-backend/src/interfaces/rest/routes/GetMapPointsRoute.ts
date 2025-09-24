import GetMapPoints from "../../../core/usecases/GetMapPoints";
import { MapPointsResponseDto } from "../../../core/dtos/MapPointDto";
import Route from "../Route";
import getMapPointSchema from "../schemas/getMapPointSchema";

export default (
    getMapPoints: GetMapPoints,
): Route<void, void, void, MapPointsResponseDto> => ({
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
                            type: "object",
                            properties: {
                                success: { type: "boolean" },
                                data: {
                                    type: "array",
                                    items: getMapPointSchema(),
                                },
                                error: { type: "string" },
                            },
                            required: ["success", "data"],
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
        try {
            const mapPoints = await getMapPoints.exec();

            const response: MapPointsResponseDto = {
                success: true,
                data: mapPoints,
            };

            res.status(200).json(response);
        } catch (error) {
            res.status(500).json({
                success: false,
                data: [],
                error: "Failed to fetch map points",
            });
        }
    },
});
