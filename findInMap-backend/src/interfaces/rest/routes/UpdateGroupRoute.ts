import Route from "../Route";
import UpdateGroup from "../../../core/usecases/UpdateGroup";
import UpdateGroupDto from "../../../core/dtos/UpdateGroupDto";
import getGroupSchema from "../schemas/getGroupSchema";
import getUpdateGroupSchema from "../schemas/getUpdateGroupSchema";
import { auhtorizationParam } from "./common/authorizationParam";
import GroupDto from "../../../core/dtos/GroupDto";

interface ReqParams {
    groupId: string;
}

type ReqBody = UpdateGroupDto;

type ResBody = Omit<GroupDto, "role">;

export default (
    updateGroup: UpdateGroup,
): Route<ReqParams, void, ReqBody, ResBody> => ({
    path: "/groups/:groupId",
    method: "put",
    operationObject: {
        tags: ["groups"],
        parameters: [
            auhtorizationParam,
            {
                name: "groupId",
                in: "path",
                required: true,
                schema: {
                    type: "string",
                },
            },
        ],
        requestBody: {
            content: {
                "application/json": {
                    schema: getUpdateGroupSchema(),
                },
            },
            required: true,
        },
        responses: {
            200: {
                description: "Group updated successfully",
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                id: {
                                    type: "string",
                                },
                                name: {
                                    type: "string",
                                },
                            },
                            required: ["id", "name"],
                        },
                    },
                },
            },
            400: {
                description: "Bad request - invalid input data",
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
            401: {
                description: "Unauthorized",
                content: {
                    "application/json": {
                        schema: getGroupSchema(),
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
            404: {
                description: "Not found - Group does not exist",
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
    handler: async (req, res, next) => {
        const { groupId } = req.params;
        const userId = (req as any).user!.userId;
        const data = req.body;

        const updatedGroup = await updateGroup.exec(userId, groupId, data);

        res.status(200).json(updatedGroup);
    },
});
