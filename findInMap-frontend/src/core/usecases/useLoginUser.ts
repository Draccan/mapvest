import { useApiClient } from "../contexts/ApiClientContext";
import { useUser } from "../contexts/UserContext";
import type LoginResponseDto from "../dtos/LoginResponseDto";
import type LoginUserDto from "../dtos/LoginUserDto";
import { useRequestWrapper } from "./utils/useRequestWrapper";

interface UseLoginUser {
    login: (credentials: LoginUserDto) => Promise<LoginResponseDto | null>;
    loading: boolean;
    error: string | null;
}

export const useLoginUser = (): UseLoginUser => {
    const apiClient = useApiClient();
    const { setUser } = useUser();

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
    };
};
