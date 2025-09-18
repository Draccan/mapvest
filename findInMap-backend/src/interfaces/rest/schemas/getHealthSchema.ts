import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types";

export default function getHealthSchema(): OpenAPIV3.SchemaObject {
    return {
        type: "object",
        properties: {
            status: {
                type: "string",
                description: "Health status of the API",
                example: "ok",
            },
            message: {
                type: "string",
                description: "Detailed health message",
                example: "FindInMap Backend API is running",
            },
            version: {
                type: "string",
                description: "Current version of the API",
                example: "1.0.0",
            },
            timestamp: {
                type: "string",
                format: "date-time",
                description: "Timestamp of the health check",
                example: "2024-01-01T00:00:00Z",
            },
        },
        required: ["status", "message", "version", "timestamp"],
        additionalProperties: false,
    };
}
