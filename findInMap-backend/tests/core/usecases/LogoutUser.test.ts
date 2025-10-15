import JwtService, { TokenType } from "../../../src/core/services/JwtService";
import TokenBlacklistService from "../../../src/core/services/TokenBlacklistService";
import LogoutUser from "../../../src/core/usecases/LogoutUser";

describe("LogoutUser", () => {
    let logoutUser: LogoutUser;
    let jwtService: JwtService;
    let tokenBlacklistService: TokenBlacklistService;

    beforeEach(() => {
        tokenBlacklistService = new TokenBlacklistService("test-secret-key");
        jwtService = new JwtService("test-secret-key", tokenBlacklistService);
        logoutUser = new LogoutUser(jwtService);
    });

    describe("exec", () => {
        it("should successfully logout with valid refresh token", async () => {
            const payload = {
                userId: "user-123",
                email: "test@example.com",
            };

            const tokenPair = jwtService.generateTokenPair(payload);

            expect(
                jwtService.verifyToken(
                    tokenPair.refreshToken,
                    TokenType.REFRESH,
                ),
            ).not.toBeNull();

            await logoutUser.exec(tokenPair.refreshToken);

            expect(
                jwtService.verifyToken(
                    tokenPair.refreshToken,
                    TokenType.REFRESH,
                ),
            ).toBeNull();
        });

        it("should not affect other valid tokens", async () => {
            const payload1 = {
                userId: "user-1",
                email: "user1@example.com",
            };
            const payload2 = {
                userId: "user-2",
                email: "user2@example.com",
            };

            const tokenPair1 = jwtService.generateTokenPair(payload1);
            const tokenPair2 = jwtService.generateTokenPair(payload2);

            await logoutUser.exec(tokenPair1.refreshToken);

            expect(
                jwtService.verifyToken(
                    tokenPair1.refreshToken,
                    TokenType.REFRESH,
                ),
            ).toBeNull();
            expect(
                jwtService.verifyToken(
                    tokenPair2.refreshToken,
                    TokenType.REFRESH,
                ),
            ).not.toBeNull();
        });
    });
});
