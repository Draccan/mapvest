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
            isPublic: {
                type: "boolean",
            },
            publicId: {
                type: "string",
                format: "uuid",
                nullable: true,
            },
        },
        required: ["id", "name", "isPublic", "publicId"],
        additionalProperties: false,
    };
}
