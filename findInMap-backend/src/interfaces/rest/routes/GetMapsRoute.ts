import MapDto from "../../../core/dtos/MapDto";
import GetGroupMaps from "../../../core/usecases/GetGroupMaps";
import Route from "../Route";
import getMapsSchema from "../schemas/getMapsSchema";
import { auhtorizationParam } from "./common/authorizationParam";

interface ReqParams {
    groupId: string;
}

export default (
    getGroupMaps: GetGroupMaps,
): Route<ReqParams, void, void, MapDto[]> => {
    return {
        path: "/:groupId/maps",
        method: "get",
        operationObject: {
            summary: "Get maps for a group",
            tags: ["Maps"],
            parameters: [
                auhtorizationParam,
                {
                    name: "groupId",
                    in: "path",
                    required: true,
                    schema: { type: "string" },
                },
            ],
            responses: {
                200: {
                    description: "List of maps of the group",
                    content: {
                        "application/json": {
                            schema: getMapsSchema(),
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

            const maps = await getGroupMaps.execute(groupId, userId);

            res.status(200).json(maps);
        },
    };
};
