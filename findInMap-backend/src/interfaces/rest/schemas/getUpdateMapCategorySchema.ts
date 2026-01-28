import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types";

export default function getUpdateMapCategorySchema(): OpenAPIV3.SchemaObject {
    return {
        type: "object",
        properties: {
            description: { type: "string" },
            color: { type: "string" },
        },
        required: ["description", "color"],
        additionalProperties: false,
    };
}