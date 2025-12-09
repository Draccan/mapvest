import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types";

export default function getUpdateUserPasswordSchema(): OpenAPIV3.SchemaObject {
    return {
        type: "object",
        properties: {
            resetToken: {
                type: "string",
                description: "Password reset token",
            },
            password: {
                type: "string",
                minLength: 8,
                maxLength: 20,
                description: "New password (8-20 characters)",
            },
        },
        required: ["resetToken", "password"],
        additionalProperties: false,
    };
}
