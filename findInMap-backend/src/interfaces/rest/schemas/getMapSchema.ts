import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types";

export default function getMapSchema(): OpenAPIV3.SchemaObject {
    return {
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
        required: ["id", "name"],
        additionalProperties: false,
    };
}
