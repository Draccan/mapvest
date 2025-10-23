import { useState } from "react";
import { useApiClient } from "../contexts/ApiClientContext";
import type LoginResponseDto from "../dtos/LoginResponseDto";
import type LoginUserDto from "../dtos/LoginUserDto";
import { useRequestWrapper } from "./utils/useRequestWrapper";

interface UseLoginUser {
    login: (credentials: LoginUserDto) => Promise<LoginResponseDto | null>;
    loading: boolean;
    error: string | null;
    user: LoginResponseDto["user"] | null;
}

export const useLoginUser = (): UseLoginUser => {
    const apiClient = useApiClient();
    const [user, setUser] = useState<LoginResponseDto["user"] | null>(null);

    const { fetch, loading, error } = useRequestWrapper(
        (credentials: LoginUserDto) => apiClient.login(credentials),
    );

    const login = async (
        credentials: LoginUserDto,
    ): Promise<LoginResponseDto | null> => {
        const response = await fetch(credentials);

        if (response) {
            setUser(response.user);
        }

        return response;
    };

    return {
        login,
        loading,
        error:
            error instanceof Error
                ? error.message
                : error
                  ? String(error)
                  : null,
        user,
    };
};
