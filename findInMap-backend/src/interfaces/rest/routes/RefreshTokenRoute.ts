import RefreshToken from "../../../core/usecases/RefreshToken";
import { RefreshTokenDto } from "../../../core/dtos/RefreshTokenDto";
import { TokenResponseDto } from "../../../core/dtos/TokenResponseDto";
import Route from "../Route";
import getTokensSchema from "../schemas/getTokensSchema";

type ReqBody = RefreshTokenDto;
type ResBody = TokenResponseDto;

export default (
    refreshToken: RefreshToken,
): Route<void, void, ReqBody, ResBody> => ({
    path: "/token/refresh",
    method: "post",
    operationObject: {
        tags: ["auth"],
        summary: "Refresh access token",
        description: "Generate a new access token using a valid refresh token",
        requestBody: {
            content: {
                "application/json": {
                    schema: {
                        type: "object",
                        properties: {
                            refreshToken: {
                                type: "string",
                                description: "Valid refresh token",
                            },
                        },
                        required: ["refreshToken"],
                    },
                },
            },
        },
        responses: {
            200: {
                description: "New access token generated successfully",
                content: {
                    "application/json": {
                        schema: getTokensSchema(),
                    },
                },
            },
            401: {
                description: "Invalid or expired refresh token",
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                error: {
                                    type: "string",
                                    description: "Error message",
                                },
                            },
                        },
                    },
                },
            },
        },
    },
    handler: async (req, res) => {
        const tokenResponse = await refreshToken.exec(req.body.refreshToken);

        if (!tokenResponse) {
            return res
                .status(401)
                .json({ error: "Invalid or expired refresh token" } as any);
        }

        res.status(200).json(tokenResponse);
    },
});
