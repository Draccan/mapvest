import RefreshToken from "../../../core/usecases/RefreshToken";
import { TokenResponseDto } from "../../../core/dtos/TokenResponseDto";
import Route from "../Route";
import getTokensSchema from "../schemas/getTokensSchema";
import { auhtorizationParam } from "./common/authorizationParam";

type ReqBody = void;
type ResBody = TokenResponseDto;

export default (
    refreshToken: RefreshToken,
): Route<void, void, ReqBody, ResBody> => ({
    path: "/token/refresh",
    method: "post",
    operationObject: {
        tags: ["auth"],
        summary: "Refresh access token",
        description:
            "Generate a new access token using a valid refresh token from Authorization header",
        parameters: [auhtorizationParam],
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
        const authHeader = req.headers.authorization;

        if (!authHeader?.startsWith("Bearer ")) {
            return res.status(401).json({
                error: "Missing or invalid Authorization header",
            } as any);
        }

        const refreshTokenValue = authHeader.substring(7);

        const tokenResponse = await refreshToken.exec(refreshTokenValue);

        if (!tokenResponse) {
            return res
                .status(401)
                .json({ error: "Invalid or expired refresh token" } as any);
        }

        res.status(200).json(tokenResponse);
    },
});
