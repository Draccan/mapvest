import JwtService, { TokenType } from "../services/JwtService";

export default class LogoutUser {
    constructor(private jwtService: JwtService) {}

    async exec(refreshToken: string): Promise<void> {
        try {
            const isValid = this.jwtService.verifyToken(
                refreshToken,
                TokenType.REFRESH,
            );
            if (!isValid) {
                return;
            }

            this.jwtService.invalidateRefreshToken(refreshToken);
        } catch (error) {
            return;
        }
    }
}
