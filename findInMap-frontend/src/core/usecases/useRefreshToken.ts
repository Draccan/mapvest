import { useState } from "react";

import { API_URL } from "../../config";
import TokenStorageService from "../../utils/TokenStorageService";
import type TokenResponseDto from "../dtos/TokenResponseDto";

interface UseRefreshToken {
    refreshToken: () => Promise<TokenResponseDto | null>;
    loading: boolean;
    error: string | null;
}

export const useRefreshToken = (): UseRefreshToken => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const refreshToken = async (): Promise<TokenResponseDto | null> => {
        setLoading(true);
        setError(null);

        try {
            const currentRefreshToken = TokenStorageService.getRefreshToken();
            if (!currentRefreshToken) {
                throw new Error("No refresh token available");
            }

            const response = await fetch(`${API_URL}/token/refresh`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    refreshToken: currentRefreshToken,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Token refresh failed");
            }

            const tokenResponse: TokenResponseDto = await response.json();

            TokenStorageService.setTokens(
                tokenResponse.accessToken,
                tokenResponse.refreshToken || currentRefreshToken,
            );

            setLoading(false);
            return tokenResponse;
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error");
            TokenStorageService.clearTokens();
            setLoading(false);
            return null;
        }
    };

    return {
        refreshToken,
        loading,
        error,
    };
};
