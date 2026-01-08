import Route from "../Route";
import AddUsersToGroup from "../../../core/usecases/AddUsersToGroup";
import AddUsersToGroupDto from "../../../core/dtos/AddUsersToGroupDto";
import getAddUsersToGroupSchema from "../schemas/getAddUsersToGroupSchema";
import { auhtorizationParam } from "./common/authorizationParam";

interface ReqParams {
    groupId: string;
}

type ReqBody = AddUsersToGroupDto;

export default (
    addUsersToGroup: AddUsersToGroup,
): Route<ReqParams, void, ReqBody, void> => ({
    path: "/groups/:groupId/users",
    method: "post",
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
                    schema: getAddUsersToGroupSchema(),
                },
            },
            required: true,
        },
        responses: {
            204: {
                description: "Users added to group successfully",
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
                    "Forbidden - user does not have permission to add users to this group",
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
        const { groupId } = req.params;
        const userId = (req as any).user!.userId;

        await addUsersToGroup.exec(userId, groupId, req.body);

        res.status(204).send();
    },
});
