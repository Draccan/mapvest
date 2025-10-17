import { Request, Response, NextFunction } from "express";

import JwtService, { TokenType } from "../../../core/services/JwtService";

export default function authMiddleware(jwtService: JwtService) {
    const refreshTokenRoutes = ["/token/refresh"];
    const accessTokenRoutes = [
        "/map-points",
        "/search/addresses",
        "/users/logout",
    ];

    return (req: Request, res: Response, next: NextFunction) => {
        const needsRefreshToken = refreshTokenRoutes.some(
            (route) => req.path === route || req.path.startsWith(route + "/"),
        );
        const needsAccessToken = accessTokenRoutes.some(
            (route) => req.path === route || req.path.startsWith(route + "/"),
        );

        if (!needsRefreshToken && !needsAccessToken) {
            return next();
        }

        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                error: "Missing or invalid Authorization header",
            });
        }

        const token = authHeader.substring(7);
        const payload = needsRefreshToken
            ? jwtService.verifyToken(token, TokenType.REFRESH)
            : jwtService.verifyToken(token, TokenType.ACCESS);

        if (!payload) {
            return res.status(401).json({
                error: "Invalid or expired token",
            });
        }

        (req as any).user = payload;

        next();
    };
}
