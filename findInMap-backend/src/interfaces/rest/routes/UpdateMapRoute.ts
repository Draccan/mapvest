import UpdateMapDto from "../../../core/dtos/UpdateMapDto";
import MapDto from "../../../core/dtos/MapDto";
import UpdateMap from "../../../core/usecases/UpdateMap";
import Route from "../Route";
import getMapSchema from "../schemas/getMapSchema";
import getUpdateMapSchema from "../schemas/getUpdateMapSchema";
import { auhtorizationParam } from "./common/authorizationParam";

interface ReqParams {
    groupId: string;
    mapId: string;
}

export default (
    updateMap: UpdateMap,
): Route<ReqParams, void, UpdateMapDto, MapDto> => {
    return {
        path: "/:groupId/maps/:mapId",
        method: "put",
        operationObject: {
            summary: "Update a map",
            tags: ["maps"],
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
                        schema: getUpdateMapSchema(),
                    },
                },
            },
            responses: {
                200: {
                    description: "Map updated successfully",
                    content: {
                        "application/json": {
                            schema: getMapSchema(),
                        },
                    },
                },
                401: {
                    description: "Unauthorized",
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
                        "Forbidden - User does not have access to this group or map",
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
                404: {
                    description: "Map not found",
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
            const { groupId, mapId } = req.params;
            const data: UpdateMapDto = req.body;

            const map = await updateMap.execute(mapId, groupId, userId, data);

            res.status(200).json(map);
        },
    };
};
