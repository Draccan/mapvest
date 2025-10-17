import { useState, useCallback } from "react";

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

    const refreshToken = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const refreshToken = TokenStorageService.getRefreshToken();
            if (!refreshToken) {
                throw new Error("No refresh token available");
            }

            const response = await fetch(`${API_URL}/token/refresh`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${refreshToken}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Token refresh failed");
            }

            const tokenResponse: TokenResponseDto = await response.json();
            return tokenResponse;
        } catch (err) {
            const error =
                err instanceof Error
                    ? err.message
                    : "Errore durante il refresh del token";
            setError(error);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        refreshToken,
        loading,
        error,
    };
};
