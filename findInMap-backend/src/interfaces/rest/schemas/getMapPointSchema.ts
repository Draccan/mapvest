import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types";

export default function getMapPointSchema(): OpenAPIV3.SchemaObject {
    return {
        type: "object",
        properties: {
            id: { type: "integer" },
            x: { type: "number", description: "Longitude coordinate" },
            y: { type: "number", description: "Latitude coordinate" },
            type: {
                type: "string",
                enum: ["Furto", "Aggressione", "Rapina"],
                description: "Type of crime",
            },
            date: {
                type: "string",
                description: "Date in DD/MM/YYYY format",
            },
            createdAt: {
                type: "string",
                format: "date-time",
                description: "Creation timestamp",
            },
        },
        required: ["id", "x", "y", "type", "date", "created_at"],
        additionalProperties: false,
    };
}
