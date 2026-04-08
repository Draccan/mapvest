import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types";

export default function getCreatePaymentCheckoutSessionSchema(): OpenAPIV3.SchemaObject {
    return {
        type: "object",
        properties: {
            groupId: { type: "string" },
        },
        required: ["groupId"],
        additionalProperties: false,
    };
}
