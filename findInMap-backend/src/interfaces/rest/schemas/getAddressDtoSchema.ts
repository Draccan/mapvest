import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types";

export default function getAddressDtoSchema(): OpenAPIV3.SchemaObject {
    return {
        type: "object",
        properties: {
            label: { type: "string" },
            lat: { type: "number" },
            long: { type: "number" },
        },
        required: ["label", "lat", "long"],
        additionalProperties: false,
    };
}
