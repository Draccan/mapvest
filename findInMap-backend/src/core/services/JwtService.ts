const jwt = require("jsonwebtoken");

import TokenBlacklistService from "./TokenBlacklistService";

interface UserPayload {
    userId: string;
    email: string;
}

interface TokenPair {
    accessToken: string;
    refreshToken: string;
}

const MinutesInSeconds15 = 15 * 60 * 1000;
export enum TokenType {
    ACCESS = "access",
    REFRESH = "refresh",
}

export default class JwtService {
    private readonly secret: string;
    private readonly accessTokenExpiresIn: string = "15m";
    private readonly refreshTokenExpiresIn: string = "1d";
    private cleanupInterval: NodeJS.Timeout;

    constructor(
        secret: string,
        private tokenBlacklistService: TokenBlacklistService,
    ) {
        this.secret = secret;
        this.cleanupInterval = setInterval(() => {
            this.tokenBlacklistService.cleanupExpiredTokens();
        }, MinutesInSeconds15);
    }

    generateTokenPair(payload: UserPayload): TokenPair {
        const now = Date.now();

        const accessToken = jwt.sign(
            { ...payload, type: TokenType.ACCESS, jti: `access_${now}` },
            this.secret,
            {
                expiresIn: this.accessTokenExpiresIn,
            },
        );

        const refreshToken = jwt.sign(
            { ...payload, type: TokenType.REFRESH, jti: `refresh_${now}` },
            this.secret,
            {
                expiresIn: this.refreshTokenExpiresIn,
            },
        );

        return {
            accessToken,
            refreshToken,
        };
    }

    verifyToken(
        token: string,
        tokenType: TokenType = TokenType.ACCESS,
    ): UserPayload | null {
        if (this.tokenBlacklistService.isTokenBlacklisted(token)) {
            return null;
        }

        try {
            const decoded = jwt.verify(token, this.secret);
            if (
                typeof decoded === "object" &&
                decoded.userId &&
                decoded.email &&
                decoded.type === tokenType
            ) {
                return {
                    userId: decoded.userId as string,
                    email: decoded.email as string,
                };
            }
            return null;
        } catch (error) {
            return null;
        }
    }

    refreshAccessToken(refreshToken: string): TokenPair | null {
        const payload = this.verifyToken(refreshToken, TokenType.REFRESH);
        if (!payload) {
            return null;
        }

        return this.generateTokenPair(payload);
    }

    invalidateRefreshToken(refreshToken: string): void {
        this.tokenBlacklistService.addToBlacklist(refreshToken);
    }

    destroy(): void {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }
        this.tokenBlacklistService.clear();
    }
}
