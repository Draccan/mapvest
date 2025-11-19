import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types";

export default function getMapPointSchema(): OpenAPIV3.SchemaObject {
    return {
        type: "object",
        properties: {
            id: { type: "string" },
            long: { type: "number", description: "Longitude coordinate" },
            lat: { type: "number", description: "Latitude coordinate" },
            type: {
                type: "string",
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
        required: ["id", "long", "lat", "date", "createdAt"],
        additionalProperties: false,
    };
}
