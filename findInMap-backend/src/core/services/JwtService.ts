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
            { ...payload, type: "access", jti: `access_${now}` },
            this.secret,
            {
                expiresIn: this.accessTokenExpiresIn,
            },
        );

        const refreshToken = jwt.sign(
            { ...payload, type: "refresh", jti: `refresh_${now}` },
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

    verifyToken(token: string): UserPayload | null {
        try {
            const decoded = jwt.verify(token, this.secret);
            if (
                typeof decoded === "object" &&
                decoded.userId &&
                decoded.email &&
                decoded.type === "access"
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

    verifyRefreshToken(token: string): UserPayload | null {
        try {
            if (this.tokenBlacklistService.isTokenBlacklisted(token)) {
                return null;
            }

            const decoded = jwt.verify(token, this.secret);
            if (
                typeof decoded === "object" &&
                decoded.userId &&
                decoded.email &&
                decoded.type === "refresh"
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
        const payload = this.verifyRefreshToken(refreshToken);
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
