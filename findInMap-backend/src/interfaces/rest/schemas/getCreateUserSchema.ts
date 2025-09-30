import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types";

export default function getCreateUserSchema(): OpenAPIV3.SchemaObject {
    return {
        type: "object",
        properties: {
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
            password: {
                type: "string",
                minLength: 8,
                maxLength: 20,
                description: "User's password (8-20 characters)",
            },
        },
        required: ["name", "surname", "email", "password"],
        additionalProperties: false,
    };
}
