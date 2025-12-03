import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types";

export default function getUpdateMapPointSchema(): OpenAPIV3.SchemaObject {
    return {
        type: "object",
        properties: {
            description: {
                type: "string",
                description: "Description of the map point",
                maxLength: 255,
            },
            date: {
                type: "string",
                description: "Date in YYYY-MM-DD format",
                pattern: "^\\d{4}-\\d{2}-\\d{2}$",
            },
            categoryId: {
                type: "string",
                description: "ID of the category associated with the map point",
            },
        },
        required: ["date"],
        additionalProperties: false,
    };
}
