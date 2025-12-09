import ResetPasswordDto from "../../../core/dtos/ResetPasswordDto";
import ResetPassword from "../../../core/usecases/ResetPassword";
import Route from "../Route";
import getResetPasswordSchema from "../schemas/getResetPasswordSchema";

type ReqBody = ResetPasswordDto;

export default (
    resetPassword: ResetPassword,
): Route<void, void, ReqBody, void> => ({
    path: "/users/resetPassword",
    method: "post",
    operationObject: {
        tags: ["users"],
        summary: "Request password reset",
        description:
            "Request a password reset link to be sent to the user's email",
        requestBody: {
            content: {
                "application/json": {
                    schema: getResetPasswordSchema(),
                },
            },
            required: true,
        },
        responses: {
            200: {
                description:
                    "Password reset request processed successfully. If the email exists, a reset link will be sent.",
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
        },
    },
    handler: async (req, res) => {
        await resetPassword.exec(req.body);
        res.status(200).json();
    },
});
