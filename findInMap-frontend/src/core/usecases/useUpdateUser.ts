import { useApiClient } from "../contexts/ApiClientContext";
import type UpdateUserDto from "../dtos/UpdateUserDto";
import { useRequestWrapper } from "./utils/useRequestWrapper";

interface UseUpdateUserPassword {
    updatePassword: (userId: string, data: UpdateUserDto) => Promise<void>;
    loading: boolean;
    error: string | null;
}

export const useUpdateUser = (): UseUpdateUserPassword => {
    const apiClient = useApiClient();

    const { fetch, loading, error } = useRequestWrapper(
        (userId: string, data: UpdateUserDto) =>
            apiClient.updateUserPassword(userId, data),
    );

    const updatePassword = async (
        userId: string,
        data: UpdateUserDto,
    ): Promise<void> => {
        await fetch(userId, data);
    };

    return {
        updatePassword,
        loading,
        error:
            error instanceof Error
                ? error.message
                : error
                  ? String(error)
                  : null,
    };
};
