import JwtService from "../../../src/core/services/JwtService";

describe("JwtService", () => {
    let jwtService: JwtService;
    const testSecret = "test-secret-key-for-jwt-testing-only";

    beforeEach(() => {
        jwtService = new JwtService(testSecret);
    });

    describe("verifyToken", () => {
        it("should verify a valid token and return payload", () => {
            const payload = {
                userId: "test-user-id",
                email: "test@example.com",
            };

            const tokenPair = jwtService.generateTokenPair(payload);
            const authenticatedUser = jwtService.verifyToken(
                tokenPair.accessToken,
            );

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

            const tokenPair = differentService.generateTokenPair(payload);
            const authenticatedUser = jwtService.verifyToken(
                tokenPair.accessToken,
            );

            expect(authenticatedUser).toBeNull();
        });

        it("should return null for malformed token", () => {
            const malformedToken = "not-a-jwt-token";
            const authenticatedUser = jwtService.verifyToken(malformedToken);

            expect(authenticatedUser).toBeNull();
        });
    });

    describe("generateTokenPair", () => {
        it("should generate both access and refresh tokens", () => {
            const payload = {
                userId: "test-user-id",
                email: "test@example.com",
            };

            const tokenPair = jwtService.generateTokenPair(payload);

            expect(tokenPair).toBeDefined();
            expect(tokenPair.accessToken).toBeDefined();
            expect(tokenPair.refreshToken).toBeDefined();
            expect(typeof tokenPair.accessToken).toBe("string");
            expect(typeof tokenPair.refreshToken).toBe("string");
        });

        it("should generate different tokens for access and refresh", () => {
            const payload = {
                userId: "test-user-id",
                email: "test@example.com",
            };

            const tokenPair = jwtService.generateTokenPair(payload);

            expect(tokenPair.accessToken).not.toBe(tokenPair.refreshToken);
        });

        it("should generate unique token pairs on multiple calls", () => {
            const payload = {
                userId: "test-user-id",
                email: "test@example.com",
            };

            const tokenPair1 = jwtService.generateTokenPair(payload);
            const tokenPair2 = jwtService.generateTokenPair(payload);

            expect(tokenPair1.accessToken).not.toBe(tokenPair2.accessToken);
            expect(tokenPair1.refreshToken).not.toBe(tokenPair2.refreshToken);
        });
    });

    describe("verifyRefreshToken", () => {
        it("should verify a valid refresh token and return payload", () => {
            const payload = {
                userId: "test-user-id",
                email: "test@example.com",
            };

            const tokenPair = jwtService.generateTokenPair(payload);
            const authenticatedUser = jwtService.verifyRefreshToken(
                tokenPair.refreshToken,
            );

            expect(authenticatedUser).toBeDefined();
            expect(authenticatedUser?.userId).toBe(payload.userId);
            expect(authenticatedUser?.email).toBe(payload.email);
        });

        it("should return null for access token passed to verifyRefreshToken", () => {
            const payload = {
                userId: "test-user-id",
                email: "test@example.com",
            };

            const tokenPair = jwtService.generateTokenPair(payload);
            const authenticatedUser = jwtService.verifyRefreshToken(
                tokenPair.accessToken,
            );

            expect(authenticatedUser).toBeNull();
        });

        it("should return null for invalid refresh token", () => {
            const invalidToken = "invalid.refresh.token";
            const authenticatedUser =
                jwtService.verifyRefreshToken(invalidToken);

            expect(authenticatedUser).toBeNull();
        });

        it("should return null for refresh token signed with different secret", () => {
            const differentService = new JwtService("different-secret");
            const payload = {
                userId: "test-user-id",
                email: "test@example.com",
            };

            const tokenPair = differentService.generateTokenPair(payload);
            const authenticatedUser = jwtService.verifyRefreshToken(
                tokenPair.refreshToken,
            );

            expect(authenticatedUser).toBeNull();
        });

        it("should return null for regular token without refresh type", () => {
            const payload = {
                userId: "test-user-id",
                email: "test@example.com",
            };

            const tokenPair = jwtService.generateTokenPair(payload);
            const authenticatedUser = jwtService.verifyRefreshToken(
                tokenPair.accessToken,
            );

            expect(authenticatedUser).toBeNull();
        });
    });

    describe("refreshAccessToken", () => {
        it("should generate new token pair from valid refresh token", () => {
            const payload = {
                userId: "test-user-id",
                email: "test@example.com",
            };

            const originalTokenPair = jwtService.generateTokenPair(payload);
            const newTokenPair = jwtService.refreshAccessToken(
                originalTokenPair.refreshToken,
            );

            expect(newTokenPair).toBeDefined();
            expect(newTokenPair?.accessToken).toBeDefined();
            expect(newTokenPair?.refreshToken).toBeDefined();
        });

        it("should generate different tokens than original", () => {
            const payload = {
                userId: "test-user-id",
                email: "test@example.com",
            };

            const originalTokenPair = jwtService.generateTokenPair(payload);
            const newTokenPair = jwtService.refreshAccessToken(
                originalTokenPair.refreshToken,
            );

            expect(newTokenPair?.accessToken).not.toBe(
                originalTokenPair.accessToken,
            );
            expect(newTokenPair?.refreshToken).not.toBe(
                originalTokenPair.refreshToken,
            );
        });

        it("should preserve user payload in new tokens", () => {
            const payload = {
                userId: "test-user-id",
                email: "test@example.com",
            };

            const originalTokenPair = jwtService.generateTokenPair(payload);
            const newTokenPair = jwtService.refreshAccessToken(
                originalTokenPair.refreshToken,
            );

            const verifiedAccess = jwtService.verifyToken(
                newTokenPair!.accessToken,
            );
            const verifiedRefresh = jwtService.verifyRefreshToken(
                newTokenPair!.refreshToken,
            );

            expect(verifiedAccess?.userId).toBe(payload.userId);
            expect(verifiedAccess?.email).toBe(payload.email);
            expect(verifiedRefresh?.userId).toBe(payload.userId);
            expect(verifiedRefresh?.email).toBe(payload.email);
        });

        it("should return null for invalid refresh token", () => {
            const invalidToken = "invalid.refresh.token";
            const newTokenPair = jwtService.refreshAccessToken(invalidToken);

            expect(newTokenPair).toBeNull();
        });

        it("should return null for access token passed to refreshAccessToken", () => {
            const payload = {
                userId: "test-user-id",
                email: "test@example.com",
            };

            const tokenPair = jwtService.generateTokenPair(payload);
            const newTokenPair = jwtService.refreshAccessToken(
                tokenPair.accessToken,
            );

            expect(newTokenPair).toBeNull();
        });

        it("should return null for regular token without refresh type", () => {
            const payload = {
                userId: "test-user-id",
                email: "test@example.com",
            };

            const tokenPair = jwtService.generateTokenPair(payload);
            const newTokenPair = jwtService.refreshAccessToken(
                tokenPair.accessToken,
            );

            expect(newTokenPair).toBeNull();
        });
    });

    describe("integration", () => {
        it("should generate and verify token in complete cycle", () => {
            const originalPayload = {
                userId: "integration-test-user",
                email: "integration@example.com",
            };

            const tokenPair = jwtService.generateTokenPair(originalPayload);
            expect(tokenPair).toBeDefined();

            const authenticatedUser = jwtService.verifyToken(
                tokenPair.accessToken,
            );
            expect(authenticatedUser).toBeDefined();
            expect(authenticatedUser?.userId).toBe(originalPayload.userId);
            expect(authenticatedUser?.email).toBe(originalPayload.email);
        });

        it("should handle complete refresh token flow", () => {
            const originalPayload = {
                userId: "refresh-flow-user",
                email: "refresh@example.com",
            };

            // 1. Generate initial token pair
            const initialTokenPair =
                jwtService.generateTokenPair(originalPayload);
            expect(initialTokenPair.accessToken).toBeDefined();
            expect(initialTokenPair.refreshToken).toBeDefined();

            // 2. Verify both tokens work
            const verifiedAccess = jwtService.verifyToken(
                initialTokenPair.accessToken,
            );
            const verifiedRefresh = jwtService.verifyRefreshToken(
                initialTokenPair.refreshToken,
            );
            expect(verifiedAccess?.userId).toBe(originalPayload.userId);
            expect(verifiedRefresh?.userId).toBe(originalPayload.userId);

            // 3. Use refresh token to get new pair
            const newTokenPair = jwtService.refreshAccessToken(
                initialTokenPair.refreshToken,
            );
            expect(newTokenPair).toBeDefined();
            expect(newTokenPair?.accessToken).not.toBe(
                initialTokenPair.accessToken,
            );
            expect(newTokenPair?.refreshToken).not.toBe(
                initialTokenPair.refreshToken,
            );

            // 4. Verify new tokens work
            const newVerifiedAccess = jwtService.verifyToken(
                newTokenPair!.accessToken,
            );
            const newVerifiedRefresh = jwtService.verifyRefreshToken(
                newTokenPair!.refreshToken,
            );
            expect(newVerifiedAccess?.userId).toBe(originalPayload.userId);
            expect(newVerifiedRefresh?.userId).toBe(originalPayload.userId);
        });
    });
});
