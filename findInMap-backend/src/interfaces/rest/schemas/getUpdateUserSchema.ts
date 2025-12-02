import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types";

export default function getUpdateUserSchema(): OpenAPIV3.SchemaObject {
    return {
        type: "object",
        properties: {
            currentPassword: {
                type: "string",
                minLength: 8,
                maxLength: 20,
                description: "Current user password",
            },
            newPassword: {
                type: "string",
                minLength: 8,
                maxLength: 20,
                description: "New user password",
            },
        },
        required: ["currentPassword", "newPassword"],
        additionalProperties: false,
    };
}
