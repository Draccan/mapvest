import Route from "../Route";
import UpdateUserInGroup from "../../../core/usecases/UpdateUserInGroup";
import UpdateUserInGroupDto from "../../../core/dtos/UpdateUserInGroupDto";
import getUpdateUserInGroupSchema from "../schemas/getUpdateUserInGroupSchema";
import { auhtorizationParam } from "./common/authorizationParam";

interface ReqParams {
    groupId: string;
    userId: string;
}

type ReqBody = UpdateUserInGroupDto;

export default (
    updateUserInGroup: UpdateUserInGroup,
): Route<ReqParams, void, ReqBody, void> => ({
    path: "/groups/:groupId/users/:userId",
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
            {
                name: "userId",
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
                    schema: getUpdateUserInGroupSchema(),
                },
            },
            required: true,
        },
        responses: {
            204: {
                description: "User updated successfully",
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
                    "Forbidden - user does not have permission to update the user in this group",
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
        const { groupId, userId } = req.params;
        const requestingUserId = (req as any).user!.userId;

        await updateUserInGroup.exec(
            requestingUserId,
            groupId,
            userId,
            req.body,
        );

        res.status(204).send();
    },
});
