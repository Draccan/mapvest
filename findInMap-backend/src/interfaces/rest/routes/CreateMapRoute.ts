import CreateMapDto from "../../../core/dtos/CreateMapDto";
import MapDto from "../../../core/dtos/MapDto";
import CreateGroupMap from "../../../core/usecases/CreateGroupMap";
import Route from "../Route";
import getMapSchema from "../schemas/getMapSchema";
import { auhtorizationParam } from "./common/authorizationParam";

interface ReqParams {
    groupId: string;
}

export default (
    createGroupMap: CreateGroupMap,
): Route<ReqParams, void, CreateMapDto, MapDto> => {
    return {
        path: "/:groupId/maps",
        method: "post",
        operationObject: {
            summary: "Create a map in a group",
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
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                name: { type: "string" },
                            },
                            required: ["name"],
                        },
                    },
                },
            },
            responses: {
                201: {
                    description: "Map created successfully",
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
                        "Forbidden - User does not have access to this group",
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
            const data: CreateMapDto = req.body;

            const map = await createGroupMap.execute(groupId, userId, data);

            res.status(201).json(map);
        },
    };
};
