import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types";

export default function getDeleteMapPointsSchema(): OpenAPIV3.SchemaObject {
    return {
        type: "object",
        properties: {
            pointIds: {
                type: "array",
                items: {
                    type: "string",
                },
                description: "Array of map point IDs to delete",
                minItems: 1,
            },
        },
        required: ["pointIds"],
    };
}
