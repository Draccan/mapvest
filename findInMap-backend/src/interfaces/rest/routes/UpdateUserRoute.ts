import UpdateUser from "../../../core/usecases/UpdateUser";
import UpdateUserDto from "../../../core/dtos/UpdateUserDto";
import Route from "../Route";
import { auhtorizationParam } from "./common/authorizationParam";
import getUpdateUserSchema from "../schemas/getUpdateUserSchema";

interface ReqParams {
    userId: string;
}

type ReqBody = UpdateUserDto;
type ResBody = void | { message: string };

export default (
    updateUserPassword: UpdateUser,
): Route<ReqParams, void, ReqBody, ResBody> => ({
    path: "/users/:userId",
    method: "put",
    operationObject: {
        tags: ["users"],
        summary: "Update user",
        description: "Update user",
        parameters: [
            auhtorizationParam,
            {
                name: "userId",
                in: "path",
                required: true,
                schema: {
                    type: "string",
                },
                description: "ID of the user",
            },
        ],
        requestBody: {
            content: {
                "application/json": {
                    schema: getUpdateUserSchema(),
                },
            },
            required: true,
        },
        responses: {
            204: {
                description: "User updated successfully",
            },
            400: {
                description: "Bad request - validation error",
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                message: {
                                    type: "string",
                                    description: "Error message",
                                },
                            },
                        },
                    },
                },
            },
            403: {
                description: "Incorrect current password",
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                message: {
                                    type: "string",
                                    description: "Error message",
                                },
                            },
                        },
                    },
                },
            },
            404: {
                description: "User not found",
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                message: {
                                    type: "string",
                                    description: "Error message",
                                },
                            },
                        },
                    },
                },
            },
        },
    },
    handler: async (req, res) => {
        const { userId } = req.params;
        await updateUserPassword.exec(userId, req.body);
        res.status(204).send();
    },
});
