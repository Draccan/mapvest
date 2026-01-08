import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types";

export default function getAddUsersToGroupSchema(): OpenAPIV3.SchemaObject {
    return {
        type: "object",
        properties: {
            userIds: {
                type: "array",
                items: {
                    type: "string",
                },
                minItems: 1,
            },
        },
        required: ["userIds"],
        additionalProperties: false,
    };
}
