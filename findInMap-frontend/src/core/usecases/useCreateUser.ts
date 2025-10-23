import { useApiClient } from "../contexts/ApiClientContext";
import type CreateUserDto from "../dtos/CreateUserDto";
import type UserDto from "../dtos/UserDto";
import { useRequestWrapper } from "./utils/useRequestWrapper";

interface UseCreateUser {
    createUser: (
        userData: CreateUserDto,
    ) => Promise<UserDto | { message: string } | null>;
    loading: boolean;
    error: string | null;
}

export const useCreateUser = (): UseCreateUser => {
    const apiClient = useApiClient();

    const { fetch, loading, error } = useRequestWrapper(
        (userData: CreateUserDto) => apiClient.createUser(userData),
    );

    const createUser = async (
        userData: CreateUserDto,
    ): Promise<UserDto | { message: string } | null> => {
        const response = await fetch(userData);
        return response;
    };

    return {
        createUser,
        loading,
        error,
    };
};
