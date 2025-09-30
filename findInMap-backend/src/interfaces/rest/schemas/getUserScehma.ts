import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types";

export default function getUserSchema(): OpenAPIV3.SchemaObject {
    return {
        type: "object",
        properties: {
            id: {
                type: "string",
                format: "uuid",
                description: "User's unique identifier",
            },
            name: {
                type: "string",
                description: "User's first name",
            },
            surname: {
                type: "string",
                description: "User's last name",
            },
            email: {
                type: "string",
                format: "email",
                description: "User's email address",
            },
            createdAt: {
                type: "string",
                format: "date-time",
                description: "When the user was created",
            },
            updatedAt: {
                type: "string",
                format: "date-time",
                description: "When the user was last updated",
            },
        },
        required: ["id", "name", "surname", "email", "createdAt", "updatedAt"],
        additionalProperties: false,
    };
}
