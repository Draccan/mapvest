import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types";

import getMapSchema from "./getMapSchema";

export default function getMapsSchema(): OpenAPIV3.SchemaObject {
    return {
        type: "array",
        items: getMapSchema(),
    };
}
