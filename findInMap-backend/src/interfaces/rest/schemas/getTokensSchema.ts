import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types";

export default function getTokensSchema(): OpenAPIV3.SchemaObject {
    return {
        type: "object",
        properties: {
            accessToken: {
                type: "string",
                description: "New access token",
            },
            refreshToken: {
                type: "string",
                description: "New refresh token",
            },
        },
        required: ["accessToken", "refreshToken"],
        additionalProperties: false,
    };
}
