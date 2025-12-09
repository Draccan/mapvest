import UpdateUserPasswordDto from "../../../core/dtos/UpdateUserPasswordDto";
import UpdateUserPassword from "../../../core/usecases/UpdateUserPassword";
import Route from "../Route";
import getUpdateUserPasswordSchema from "../schemas/getUpdateUserPasswordSchema";

type ReqBody = UpdateUserPasswordDto;

export default (
    updateUserPassword: UpdateUserPassword,
): Route<void, void, ReqBody, void> => ({
    path: "/users/password",
    method: "put",
    operationObject: {
        tags: ["users"],
        summary: "Update user password with reset token",
        description: "Update user password using a valid password reset token",
        requestBody: {
            content: {
                "application/json": {
                    schema: getUpdateUserPasswordSchema(),
                },
            },
            required: true,
        },
        responses: {
            204: {
                description: "Password updated successfully",
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
            401: {
                description: "Invalid or expired reset token",
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                error: {
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
        await updateUserPassword.exec(req.body);
        res.status(204).send();
    },
});
