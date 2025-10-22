import { useState } from "react";

import { useApiClient } from "../contexts/ApiClientContext";
import type LoginResponseDto from "../dtos/LoginResponseDto";
import type LoginUserDto from "../dtos/LoginUserDto";

interface UseLoginUser {
    login: (credentials: LoginUserDto) => Promise<LoginResponseDto | null>;
    loading: boolean;
    error: string | null;
    user: LoginResponseDto["user"] | null;
}

export const useLoginUser = (): UseLoginUser => {
    const apiClient = useApiClient();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<LoginResponseDto["user"] | null>(null);

    const login = async (
        credentials: LoginUserDto,
    ): Promise<LoginResponseDto | null> => {
        setLoading(true);
        setError(null);

        try {
            const response = await apiClient.login(credentials);

            setUser(response.user);
            return response;
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error");
            return null;
        } finally {
            setLoading(false);
        }
    };

    return {
        login,
        loading,
        error,
        user,
    };
};
