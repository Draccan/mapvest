import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types";

export default function getMapsSchema(): OpenAPIV3.SchemaObject {
    return {
        type: "array",
        items: {
            type: "object",
            properties: {
                id: {
                    type: "string",
                    format: "uuid",
                },
                name: {
                    type: "string",
                },
            },
            required: ["id", "name", "role"],
            additionalProperties: false,
        },
    };
}
