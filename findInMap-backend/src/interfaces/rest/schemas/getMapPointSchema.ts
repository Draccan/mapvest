import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types";

export default function getMapPointSchema(): OpenAPIV3.SchemaObject {
    return {
        type: "object",
        properties: {
            id: { type: "string" },
            long: { type: "number", description: "Longitude coordinate" },
            lat: { type: "number", description: "Latitude coordinate" },
            description: {
                type: "string",
                description: "Description of the map point",
            },
            date: {
                type: "string",
                description: "Date in YYYY-MM-DD format",
                pattern: "^\\d{4}-\\d{2}-\\d{2}$",
            },
            dueDate: {
                type: "string",
                description: "Due date in YYYY-MM-DD format (optional)",
                pattern: "^\\d{4}-\\d{2}-\\d{2}$",
            },
            notes: {
                type: "string",
                description: "Additional notes for the map point (optional)",
            },
            createdAt: {
                type: "string",
                format: "date-time",
                description: "Creation timestamp",
            },
            categoryId: {
                type: "string",
                description: "ID of the category associated with the map point",
            },
        },
        required: ["id", "long", "lat", "date", "createdAt"],
        additionalProperties: false,
    };
}
