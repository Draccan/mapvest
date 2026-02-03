import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types";

import getMapPointSchema from "./getMapPointSchema";

export default function getImportMapPointsResultSchema(): OpenAPIV3.SchemaObject {
    return {
        type: "object",
        properties: {
            imported: {
                type: "array",
                items: getMapPointSchema(),
            },
            errors: {
                type: "array",
                items: {
                    type: "object",
                    required: ["row", "error"],
                    properties: {
                        row: {
                            type: "integer",
                            description:
                                "Row number in the file (1-based, excluding header)",
                        },
                        error: {
                            type: "string",
                            description: "Error message for this row",
                        },
                    },
                },
            },
            totalRows: {
                type: "integer",
                description: "Total number of data rows in the file",
            },
            successCount: {
                type: "integer",
                description: "Number of successfully imported points",
            },
            errorCount: {
                type: "integer",
                description: "Number of rows that failed validation",
            },
        },
        required: [
            "imported",
            "errors",
            "totalRows",
            "successCount",
            "errorCount",
        ],
    };
}
