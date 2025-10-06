import JwtService from "../services/JwtService";
import { TokenResponseDto } from "../dtos/TokenResponseDto";

export default class RefreshToken {
    constructor(private jwtService: JwtService) {}

    async exec(refreshToken: string): Promise<TokenResponseDto | null> {
        const tokenPair = this.jwtService.refreshAccessToken(refreshToken);

        if (!tokenPair) {
            return null;
        }

        return {
            accessToken: tokenPair.accessToken,
            refreshToken: tokenPair.refreshToken,
        };
    }
}
