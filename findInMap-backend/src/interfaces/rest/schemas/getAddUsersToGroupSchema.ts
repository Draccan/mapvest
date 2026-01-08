import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types";

export default function getAddUsersToGroupSchema(): OpenAPIV3.SchemaObject {
    return {
        type: "object",
        properties: {
            userEmails: {
                type: "array",
                items: {
                    type: "string",
                    format: "email",
                },
                minItems: 1,
            },
        },
        required: ["userEmails"],
        additionalProperties: false,
    };
}
