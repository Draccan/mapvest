import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types";

import { MapPointType } from "../../../core/commons/enums";

export default function getMapPointSchema(): OpenAPIV3.SchemaObject {
    return {
        type: "object",
        properties: {
            id: { type: "string" },
            long: { type: "number", description: "Longitude coordinate" },
            lat: { type: "number", description: "Latitude coordinate" },
            type: {
                type: "string",
                enum: Object.values(MapPointType),
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
        required: ["id", "long", "lat", "type", "date", "createdAt"],
        additionalProperties: false,
    };
}
