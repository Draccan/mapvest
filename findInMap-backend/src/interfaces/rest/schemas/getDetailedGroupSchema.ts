import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types";

import { Plan, UserGroupRole } from "../../../core/commons/enums";
import getGroupSchema from "./getGroupSchema";

export default function getDetailedGroupSchema(): OpenAPIV3.SchemaObject {
    return {
        type: "object",
        properties: {
            ...getGroupSchema().properties,
            role: {
                type: "string",
                enum: Object.values(UserGroupRole),
            },
            plan: {
                type: "string",
                enum: Object.values(Plan),
            },
        },
        required: ["id", "name", "role", "plan"],
        additionalProperties: false,
    };
}
