import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types";

import { MapPointType } from "../../../core/commons/enums";

export default function getCreateMapPointSchema(): OpenAPIV3.SchemaObject {
    return {
        type: "object",
        properties: {
            x: {
                type: "number",
                description: "Longitude coordinate",
                maximum: 180,
                minimum: -180,
            },
            y: {
                type: "number",
                description: "Latitude coordinate",
                maximum: 90,
                minimum: -90,
            },
            type: {
                type: "string",
                enum: Object.values(MapPointType),
                description: "Type of crime",
            },
            date: {
                type: "string",
                description: "Date in DD/MM/YYYY format",
                pattern: "^\\d{2}/\\d{2}/\\d{4}$",
            },
        },
        required: ["x", "y", "type", "date"],
        additionalProperties: false,
    };
}
