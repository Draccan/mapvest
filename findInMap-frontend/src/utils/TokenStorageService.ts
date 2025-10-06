class TokenStorageService {
    private static readonly REFRESH_TOKEN_KEY = "refresh_token";

    private static accessToken: string | null = null;

    static setTokens(accessToken: string, refreshToken: string): void {
        this.accessToken = accessToken;
        localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    }

    static getAccessToken(): string | null {
        return this.accessToken;
    }

    static getRefreshToken(): string | null {
        return localStorage.getItem(this.REFRESH_TOKEN_KEY);
    }

    static clearTokens(): void {
        this.accessToken = null;
        localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    }

    static hasValidTokens(): boolean {
        return !!(this.getAccessToken() && this.getRefreshToken());
    }

    static hasRefreshToken(): boolean {
        return !!this.getRefreshToken();
    }
}

export default TokenStorageService;
