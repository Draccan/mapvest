import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types";

export default function getCreateMapPointSchema(): OpenAPIV3.SchemaObject {
    return {
        type: "object",
        properties: {
            long: {
                type: "number",
                description: "Longitude coordinate",
                maximum: 180,
                minimum: -180,
            },
            lat: {
                type: "number",
                description: "Latitude coordinate",
                maximum: 90,
                minimum: -90,
            },
            description: {
                type: "string",
                description: "Type of crime",
                maxLength: 255,
            },
            date: {
                type: "string",
                description: "Date in DD/MM/YYYY format",
                pattern: "^\\d{2}/\\d{2}/\\d{4}$",
            },
            categoryId: {
                type: "string",
                description: "ID of the category associated with the map point",
            },
        },
        required: ["long", "lat", "date"],
        additionalProperties: false,
    };
}
