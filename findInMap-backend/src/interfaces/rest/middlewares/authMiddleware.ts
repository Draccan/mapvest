import { Request, Response, NextFunction } from "express";

import JwtService, { TokenType } from "../../../core/services/JwtService";

const PublicRoutes = [
    "/health",
    "/info",
    "/swagger/*",
    "/users",
    "/users/login",
    "/users/resetPassword",
    "/users/password",
    "/public/maps/*",
    "/favicon.ico",
];

const RefreshTokenRoutes = ["/token/refresh", "/users/logout"];

export default function authMiddleware(jwtService: JwtService) {
    return (req: Request, res: Response, next: NextFunction) => {
        const isPublicRoute = PublicRoutes.some(
            (route) =>
                req.path === route ||
                (route.endsWith("/*") &&
                    req.path.startsWith(route.slice(0, -2))),
        );

        if (isPublicRoute) {
            return next();
        }

        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                error: "Missing or invalid Authorization header",
            });
        }

        const token = authHeader.substring(7);

        const needsRefreshToken = RefreshTokenRoutes.some(
            (route) => req.path === route,
        );

        const tokenType = needsRefreshToken
            ? TokenType.REFRESH
            : TokenType.ACCESS;
        const payload = jwtService.verifyToken(token, tokenType);

        if (!payload) {
            return res.status(401).json({
                error: "Invalid or expired token",
            });
        }

        (req as any).user = payload;

        next();
    };
}
