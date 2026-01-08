import UserGroupDto from "../../../core/dtos/UserGroupDto";
import GetGroupUsers from "../../../core/usecases/GetGroupUsers";
import Route from "../Route";
import getUserGroupSchema from "../schemas/getUserGroupSchema";
import { auhtorizationParam } from "./common/authorizationParam";

interface ReqParams {
    groupId: string;
}

export default (
    getGroupUsers: GetGroupUsers,
): Route<ReqParams, void, void, UserGroupDto[]> => ({
    path: "/groups/:groupId/users",
    method: "get",
    operationObject: {
        tags: ["groups"],
        summary: "Get group users",
        description: "Retrieve all users that belong to a specific group",
        parameters: [
            auhtorizationParam,
            {
                name: "groupId",
                in: "path",
                required: true,
                schema: {
                    type: "string",
                    format: "uuid",
                },
                description: "The unique identifier of the group",
            },
        ],
        responses: {
            200: {
                description: "List of users in the group",
                content: {
                    "application/json": {
                        schema: {
                            type: "array",
                            items: getUserGroupSchema(),
                        },
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
        const { groupId } = req.params;

        const users = await getGroupUsers.exec(groupId, userId);

        res.status(200).json(users);
    },
});
