import { useState } from "react";

import { API_URL } from "../../config";
import TokenStorageService from "../../utils/TokenStorageService";
import type LoginResponseDto from "../dtos/LoginResponseDto";
import type LoginUserDto from "../dtos/LoginUserDto";

interface UseLoginUser {
    login: (credentials: LoginUserDto) => Promise<LoginResponseDto | null>;
    loading: boolean;
    error: string | null;
    user: LoginResponseDto["user"] | null;
}

export const useLoginUser = (): UseLoginUser => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<LoginResponseDto["user"] | null>(null);

    const login = async (
        credentials: LoginUserDto,
    ): Promise<LoginResponseDto | null> => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_URL}/users/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(credentials),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Login failed");
            }

            const loginResponse: LoginResponseDto = await response.json();

            TokenStorageService.setTokens(
                loginResponse.token,
                loginResponse.refreshToken,
            );

            setUser(loginResponse.user);
            return loginResponse;
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
