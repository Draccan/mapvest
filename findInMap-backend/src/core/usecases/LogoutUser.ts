import JwtService from "../services/JwtService";

export default class LogoutUser {
    constructor(private jwtService: JwtService) {}

    async exec(refreshToken: string): Promise<void> {
        try {
            const isValid = this.jwtService.verifyRefreshToken(refreshToken);
            if (!isValid) {
                return;
            }

            this.jwtService.invalidateRefreshToken(refreshToken);
        } catch (error) {
            return;
        }
    }
}
