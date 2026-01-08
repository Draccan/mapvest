import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types";
import { UserGroupRole } from "../../../core/commons/enums";

export default function getUserGroupSchema(): OpenAPIV3.SchemaObject {
    return {
        type: "object",
        properties: {
            id: {
                type: "string",
                format: "uuid",
                description: "User's unique identifier",
            },
            name: {
                type: "string",
                description: "User's first name",
            },
            surname: {
                type: "string",
                description: "User's last name",
            },
            email: {
                type: "string",
                format: "email",
                description: "User's email address",
            },
            userGroupRole: {
                type: "string",
                enum: Object.values(UserGroupRole),
                description: "User's role in the group",
            },
        },
        required: ["id", "name", "surname", "email", "userGroupRole"],
        additionalProperties: false,
    };
}
