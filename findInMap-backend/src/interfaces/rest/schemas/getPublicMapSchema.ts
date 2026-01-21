import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types";

export default function getPublicMapSchema(): OpenAPIV3.SchemaObject {
    return {
        type: "object",
        properties: {
            name: { type: "string" },
            publicId: { type: "string" },
        },
        required: ["name", "publicId"],
        additionalProperties: false,
    };
}
