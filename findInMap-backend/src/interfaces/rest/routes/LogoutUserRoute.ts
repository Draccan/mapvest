import LogoutUser from "../../../core/usecases/LogoutUser";
import Route from "../Route";
import { auhtorizationParam } from "./common/authorizationParam";

type ReqBody = void;
type ResBody = { message: string };

export default (
    logoutUser: LogoutUser,
): Route<void, void, ReqBody, ResBody> => ({
    path: "/users/logout",
    method: "post",
    operationObject: {
        tags: ["auth"],
        summary: "Logout user",
        description: "Invalidate refresh token and logout user",
        parameters: [auhtorizationParam],
        responses: {
            200: {
                description: "Successfully logged out",
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                message: {
                                    type: "string",
                                    description: "Success message",
                                },
                            },
                        },
                    },
                },
            },
            401: {
                description: "Invalid or missing refresh token",
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

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                error: "Missing or invalid Authorization header",
            } as any);
        }

        const refreshToken = authHeader.substring(7);

        await logoutUser.exec(refreshToken);

        res.status(200).json({ message: "Successfully logged out" });
    },
});
