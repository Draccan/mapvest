import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types";

export default function getResetPasswordSchema(): OpenAPIV3.SchemaObject {
    return {
        type: "object",
        properties: {
            email: {
                type: "string",
                format: "email",
                description: "User's email address",
            },
        },
        required: ["email"],
        additionalProperties: false,
    };
}
