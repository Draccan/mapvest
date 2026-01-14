import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types";
import { UserGroupRole } from "../../../core/commons/enums";

export default function getUpdateUserInGroupSchema(): OpenAPIV3.SchemaObject {
    return {
        type: "object",
        properties: {
            role: {
                type: "string",
                enum: [UserGroupRole.Admin, UserGroupRole.Contributor],
            },
        },
        required: ["role"],
        additionalProperties: false,
    };
}
