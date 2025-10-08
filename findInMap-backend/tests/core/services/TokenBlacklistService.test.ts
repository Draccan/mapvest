import TokenBlacklistService from "../../../src/core/services/TokenBlacklistService";
import JwtService from "../../../src/core/services/JwtService";

describe("TokenBlacklistService", () => {
    let service: TokenBlacklistService;
    const testSecret = "test-secret-key";

    beforeEach(() => {
        service = new TokenBlacklistService(testSecret);
    });

    describe("addToBlacklist", () => {
        it("should add token to blacklist", () => {
            const token = "test-token-123";

            service.addToBlacklist(token);

            expect(service.isTokenBlacklisted(token)).toBe(true);
        });

        it("should handle multiple tokens", () => {
            const token1 = "test-token-1";
            const token2 = "test-token-2";

            service.addToBlacklist(token1);
            service.addToBlacklist(token2);

            expect(service.isTokenBlacklisted(token1)).toBe(true);
            expect(service.isTokenBlacklisted(token2)).toBe(true);
        });
    });

    describe("isTokenBlacklisted", () => {
        it("should return false for non-blacklisted token", () => {
            const token = "test-token-123";

            expect(service.isTokenBlacklisted(token)).toBe(false);
        });

        it("should return true for blacklisted token", () => {
            const token = "test-token-123";

            service.addToBlacklist(token);

            expect(service.isTokenBlacklisted(token)).toBe(true);
        });
    });

    describe("size", () => {
        it("should return 0 for empty blacklist", () => {
            expect(service.size()).toBe(0);
        });

        it("should return correct size after adding tokens", () => {
            service.addToBlacklist("token1");
            service.addToBlacklist("token2");

            expect(service.size()).toBe(2);
        });
    });

    describe("cleanupExpiredTokens", () => {
        it("should remove malformed tokens", () => {
            const malformedToken1 = "invalid-token";
            const malformedToken2 = "header.payload";

            service.addToBlacklist(malformedToken1);
            service.addToBlacklist(malformedToken2);

            expect(service.size()).toBe(2);

            service.cleanupExpiredTokens();

            expect(service.size()).toBe(0);
        });

        it("should not remove valid tokens", () => {
            const jwtService = new JwtService(testSecret, service);

            const validPayload = {
                userId: "user-1",
                email: "user@example.com",
            };

            const validToken =
                jwtService.generateTokenPair(validPayload).refreshToken;

            service.addToBlacklist(validToken);

            service.cleanupExpiredTokens();

            expect(service.size()).toBe(1);
        });
    });

    describe("clear", () => {
        it("should clear all blacklisted tokens", () => {
            service.addToBlacklist("token1");
            service.addToBlacklist("token2");

            expect(service.size()).toBe(2);

            service.clear();

            expect(service.size()).toBe(0);
            expect(service.isTokenBlacklisted("token1")).toBe(false);
            expect(service.isTokenBlacklisted("token2")).toBe(false);
        });
    });
});
