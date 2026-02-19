import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types";
import { Plan } from "../../../core/commons/enums";

export default function getPlanSchema(): OpenAPIV3.SchemaObject {
    return {
        type: "object",
        properties: {
            name: { type: "string", enum: Object.values(Plan) },
            maxMapPoints: { type: "integer" },
        },
        required: ["name", "maxMapPoints"],
        additionalProperties: false,
    };
}
