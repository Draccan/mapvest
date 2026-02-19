import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types";

import { Plan } from "../../../core/commons/enums";

export default function getGroupSchema(): OpenAPIV3.SchemaObject {
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
            plan: {
                type: "string",
                enum: Object.values(Plan),
            },
        },
        required: ["id", "name", "plan"],
        additionalProperties: false,
    };
}
