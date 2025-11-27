import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types";

export default function getMapCategorySchema(): OpenAPIV3.SchemaObject {
    return {
        type: "object",
        properties: {
            id: { type: "string" },
            description: { type: "string" },
            color: { type: "string" },
        },
        required: ["id", "description", "color"],
        additionalProperties: false,
    };
}
