import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types";

import { UserGroupRole } from "../../../core/commons/enums";
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
        },
        required: ["id", "name", "role"],
        additionalProperties: false,
    };
}
