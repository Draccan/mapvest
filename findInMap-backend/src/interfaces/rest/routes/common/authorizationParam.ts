import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types";

export const auhtorizationParam: OpenAPIV3.ParameterObject = {
    name: "Authorization",
    in: "header",
    required: true,
    description: "Bearer token with refresh token",
    schema: {
        type: "string",
        pattern: "^Bearer .+",
    },
};
