import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types";

export default function getInfoSchema(): OpenAPIV3.SchemaObject {
    return {
        type: "object",
        properties: {
            appName: { type: "string", example: "FindInMap" },
            version: { type: "string", example: "1.0.0" },
            description: {
                type: "string",
                example: "API for managing map points and locations",
            },
            swagger: {
                type: "string",
                example: "http://localhost:3001/swagger",
            },
        },
        required: ["appName", "version", "description"],
    };
}
