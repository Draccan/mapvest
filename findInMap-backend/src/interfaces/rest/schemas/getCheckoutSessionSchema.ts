import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types";
import { url } from "inspector";

export default function getCheckoutSessionSchema(): OpenAPIV3.SchemaObject {
    return {
        type: "object",
        properties: {
            url: { type: "string" },
        },
        required: ["url"],
        additionalProperties: false,
    };
}
