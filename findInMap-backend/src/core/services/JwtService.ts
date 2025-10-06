const jwt = require("jsonwebtoken");

interface UserPayload {
    userId: string;
    email: string;
}

interface TokenPair {
    accessToken: string;
    refreshToken: string;
}

export default class JwtService {
    private readonly secret: string;
    private readonly accessTokenExpiresIn: string = "15m";
    private readonly refreshTokenExpiresIn: string = "1d";

    constructor(secret: string) {
        this.secret = secret;
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
                decoded.email
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
}
