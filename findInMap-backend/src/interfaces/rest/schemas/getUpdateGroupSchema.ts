import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types";

export default function getUpdateGroupSchema(): OpenAPIV3.SchemaObject {
    return {
        type: "object",
        properties: {
            name: {
                type: "string",
                minLength: 1,
            },
        },
        required: ["name"],
        additionalProperties: false,
    };
}
