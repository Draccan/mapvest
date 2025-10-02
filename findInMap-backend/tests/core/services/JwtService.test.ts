import JwtService from "../../../src/core/services/JwtService";

describe("JwtService", () => {
    let jwtService: JwtService;
    const testSecret = "test-secret-key-for-jwt-testing-only";

    beforeEach(() => {
        jwtService = new JwtService(testSecret);
    });

    describe("generateToken", () => {
        it("should generate a valid JWT token", () => {
            const payload = {
                userId: "test-user-id",
                email: "test@example.com",
            };

            const token = jwtService.generateToken(payload);

            expect(token).toBeDefined();
            expect(typeof token).toBe("string");
            expect(token.split(".")).toHaveLength(3);
        });

        it("should generate different tokens for different payloads", () => {
            const payload1 = {
                userId: "user1",
                email: "user1@example.com",
            };
            const payload2 = {
                userId: "user2",
                email: "user2@example.com",
            };

            const token1 = jwtService.generateToken(payload1);
            const token2 = jwtService.generateToken(payload2);

            expect(token1).not.toBe(token2);
        });
    });

    describe("verifyToken", () => {
        it("should verify a valid token and return payload", () => {
            const payload = {
                userId: "test-user-id",
                email: "test@example.com",
            };

            const token = jwtService.generateToken(payload);
            const authenticatedUser = jwtService.verifyToken(token);

            expect(authenticatedUser).toBeDefined();
            expect(authenticatedUser?.userId).toBe(payload.userId);
            expect(authenticatedUser?.email).toBe(payload.email);
        });

        it("should return null for invalid token", () => {
            const invalidToken = "invalid.token.here";
            const authenticatedUser = jwtService.verifyToken(invalidToken);

            expect(authenticatedUser).toBeNull();
        });

        it("should return null for token signed with different secret", () => {
            const differentService = new JwtService("different-secret");
            const payload = {
                userId: "test-user-id",
                email: "test@example.com",
            };

            const token = differentService.generateToken(payload);
            const authenticatedUser = jwtService.verifyToken(token);

            expect(authenticatedUser).toBeNull();
        });

        it("should return null for malformed token", () => {
            const malformedToken = "not-a-jwt-token";
            const authenticatedUser = jwtService.verifyToken(malformedToken);

            expect(authenticatedUser).toBeNull();
        });
    });

    describe("integration", () => {
        it("should generate and verify token in complete cycle", () => {
            const originalPayload = {
                userId: "integration-test-user",
                email: "integration@example.com",
            };

            const token = jwtService.generateToken(originalPayload);
            expect(token).toBeDefined();

            const authenticatedUser = jwtService.verifyToken(token);
            expect(authenticatedUser).toBeDefined();
            expect(authenticatedUser?.userId).toBe(originalPayload.userId);
            expect(authenticatedUser?.email).toBe(originalPayload.email);
        });
    });
});
