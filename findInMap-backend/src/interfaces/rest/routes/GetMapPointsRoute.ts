import { MapPointDto } from "../../../core/dtos/MapPointDto";
import GetMapPoints from "../../../core/usecases/GetMapPoints";
import Route from "../Route";
import getMapPointSchema from "../schemas/getMapPointSchema";
import { auhtorizationParam } from "./common/authorizationParam";

interface ReqParams {
    groupId: string;
    mapId: string;
}

export default (
    getMapPoints: GetMapPoints,
): Route<ReqParams, void, void, MapPointDto[]> => ({
    path: "/:groupId/maps/:mapId/points",
    method: "get",
    operationObject: {
        tags: ["maps"],
        summary: "Get all map points",
        description: "Retrieve all map points from the database",
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
        const mapPoints = await getMapPoints.exec(userId, groupId, mapId);

        res.status(200).json(mapPoints);
    },
});
