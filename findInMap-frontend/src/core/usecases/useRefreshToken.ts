import { useState, useCallback } from "react";

import type TokenResponseDto from "../dtos/TokenResponseDto";
import { useApiClient } from "../contexts/ApiClientContext";

interface UseRefreshToken {
    refreshToken: () => Promise<TokenResponseDto | null>;
    loading: boolean;
    error: string | null;
}

export const useRefreshToken = (): UseRefreshToken => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const apiClient = useApiClient();

    const refreshToken = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const tokenResponse = apiClient.refreshToken();
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
