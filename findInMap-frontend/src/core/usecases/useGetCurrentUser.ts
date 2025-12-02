import { useApiClient } from "../contexts/ApiClientContext";
import { useUser } from "../contexts/UserContext";
import type UserDto from "../dtos/UserDto";
import { useRequestWrapper } from "./utils/useRequestWrapper";

interface UseGetCurrentUser {
    getCurrentUser: () => Promise<UserDto | null>;
    loading: boolean;
    error: string | null;
}

export const useGetCurrentUser = (): UseGetCurrentUser => {
    const apiClient = useApiClient();
    const { setUser } = useUser();

    const { fetch, loading, error } = useRequestWrapper(() =>
        apiClient.getCurrentUser(),
    );

    const getCurrentUser = async (): Promise<UserDto | null> => {
        const user = await fetch();
        if (user) {
            setUser(user);
        }
        return user;
    };

    return {
        getCurrentUser,
        loading,
        error:
            error instanceof Error
                ? error.message
                : error
                  ? String(error)
                  : null,
    };
};
