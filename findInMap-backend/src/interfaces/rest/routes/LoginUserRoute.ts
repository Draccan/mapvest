import LoginUser from "../../../core/usecases/LoginUser";
import LoginUserDto from "../../../core/dtos/LoginUserDto";
import LoginResponseDto from "../../../core/dtos/LoginResponseDto";
import Route from "../Route";
import getUserLoginSchema from "../schemas/getUserLoginSchema";

type ReqBody = LoginUserDto;
type ResBody = LoginResponseDto;

export default (loginUser: LoginUser): Route<void, void, ReqBody, ResBody> => ({
    path: "/users/login",
    method: "post",
    operationObject: {
        tags: ["users"],
        summary: "User login",
        description: "Authenticate user with email and password",
        requestBody: {
            content: {
                "application/json": {
                    schema: {
                        type: "object",
                        properties: {
                            email: {
                                type: "string",
                                format: "email",
                                description: "User email address",
                            },
                            password: {
                                type: "string",
                                minLength: 8,
                                maxLength: 20,
                                description: "User password",
                            },
                        },
                        required: ["email", "password"],
                    },
                },
            },
            required: true,
        },
        responses: {
            200: {
                description: "Login successful",
                content: {
                    "application/json": {
                        schema: getUserLoginSchema(),
                    },
                },
            },
            401: {
                description: "Invalid credentials",
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
        const loginResponse = await loginUser.exec(req.body);
        res.status(200).json(loginResponse);
    },
});
