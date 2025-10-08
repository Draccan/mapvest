const jwt = require("jsonwebtoken");

export default class TokenBlacklistService {
    private readonly secret: string;
    private blacklistedTokens: Set<string> = new Set();

    constructor(jwtSecret: string) {
        this.secret = jwtSecret;
    }

    addToBlacklist(token: string): void {
        this.blacklistedTokens.add(token);
    }

    isTokenBlacklisted(token: string): boolean {
        return this.blacklistedTokens.has(token);
    }

    cleanupExpiredTokens(): void {
        const nowInSeconds = Math.floor(Date.now() / 1000);

        for (const token of this.blacklistedTokens) {
            if (this.isTokenExpired(token, nowInSeconds)) {
                this.blacklistedTokens.delete(token);
            }
        }
    }

    private isTokenExpired(
        token: string,
        currentTimeInSeconds: number,
    ): boolean {
        try {
            const decoded = jwt.verify(token, this.secret);

            if (typeof decoded === "object" && decoded.exp) {
                return decoded.exp <= currentTimeInSeconds;
            }

            return true;
        } catch (error) {
            return true;
        }
    }

    clear(): void {
        this.blacklistedTokens.clear();
    }

    size(): number {
        return this.blacklistedTokens.size;
    }
}
