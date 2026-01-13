import Route from "../Route";
import RemoveUserFromGroup from "../../../core/usecases/RemoveUserFromGroup";
import { auhtorizationParam } from "./common/authorizationParam";

interface ReqParams {
    groupId: string;
    userId: string;
}

export default (
    removeUserFromGroup: RemoveUserFromGroup,
): Route<ReqParams, void, void, void> => ({
    path: "/groups/:groupId/users/:userId",
    method: "delete",
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
                    format: "uuid",
                },
            },
            {
                name: "userId",
                in: "path",
                required: true,
                schema: {
                    type: "string",
                    format: "uuid",
                },
            },
        ],
        responses: {
            204: {
                description: "User removed from group successfully",
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
                    "Forbidden - user does not have permission to remove users from this group",
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

        await removeUserFromGroup.exec(requestingUserId, groupId, userId);

        res.status(204).send();
    },
});
