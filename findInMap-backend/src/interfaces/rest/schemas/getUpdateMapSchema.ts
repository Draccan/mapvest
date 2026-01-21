import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types";

export default function getUpdateMapSchema(): OpenAPIV3.SchemaObject {
    return {
        type: "object",
        properties: {
            name: { type: "string" },
            isPublic: { type: "boolean" },
        },
        additionalProperties: false,
    };
}
