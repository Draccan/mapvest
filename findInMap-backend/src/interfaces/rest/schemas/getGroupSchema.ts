import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types";

import { UserGroupRole } from "../../../core/commons/enums";

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
            role: {
                type: "string",
                enum: Object.values(UserGroupRole),
            },
        },
        required: ["id", "name", "role"],
        additionalProperties: false,
    };
}
