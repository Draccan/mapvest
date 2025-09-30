import CreateUserDto from "../../../core/dtos/CreateUserDto";
import UserDto from "../../../core/dtos/UserDto";
import CreateUser from "../../../core/usecases/CreateUser";
import Route from "../Route";
import getCreateUserSchema from "../schemas/getCreateUserSchema";
import getUserSchema from "../schemas/getUserScehma";

type ReqBody = CreateUserDto;
type ResBody = UserDto | { message: string };

export default (
    createUser: CreateUser,
): Route<void, void, ReqBody, ResBody> => ({
    path: "/users",
    method: "post",
    operationObject: {
        tags: ["users"],
        summary: "Create a new user",
        requestBody: {
            content: {
                "application/json": {
                    schema: getCreateUserSchema(),
                },
            },
            required: true,
        },
        responses: {
            201: {
                description: "User created successfully",
                content: {
                    "application/json": {
                        schema: getUserSchema(),
                    },
                },
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
            409: {
                description: "Conflict - email already registered",
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
        try {
            const user = await createUser.exec(req.body);
            res.status(201).json(user);
        } catch (error: any) {
            if (error.name === "UserEmailAlreadyRegistered") {
                res.status(409).json({ message: error.message });
            } else if (error.message.includes("Password must be")) {
                res.status(400).json({ message: error.message });
            } else {
                throw error;
            }
        }
    },
});
