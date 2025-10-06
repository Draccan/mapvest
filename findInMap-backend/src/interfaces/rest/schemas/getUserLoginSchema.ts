import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types";

export default function getUserSchema(): OpenAPIV3.SchemaObject {
    return {
        type: "object",
        properties: {
            token: {
                type: "string",
                description: "JWT authentication token",
            },
            refreshToken: {
                type: "string",
                description: "JWT refresh token",
            },
            user: {
                type: "object",
                properties: {
                    id: {
                        type: "string",
                        description: "User ID",
                    },
                    name: {
                        type: "string",
                        description: "User first name",
                    },
                    surname: {
                        type: "string",
                        description: "User last name",
                    },
                    email: {
                        type: "string",
                        format: "email",
                        description: "User email address",
                    },
                },
                required: ["id", "name", "surname", "email"],
            },
        },
        required: ["token", "refreshToken", "user"],
        additionalProperties: false,
    };
}
