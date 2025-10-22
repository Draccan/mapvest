import { useState } from "react";

import { useApiClient } from "../contexts/ApiClientContext";
import type CreateUserDto from "../dtos/CreateUserDto";
import type UserDto from "../dtos/UserDto";

interface UseCreateUser {
    createUser: (
        userData: CreateUserDto,
    ) => Promise<UserDto | { message: string } | null>;
    loading: boolean;
    error: string | null;
}

export const useCreateUser = (): UseCreateUser => {
    const apiClient = useApiClient();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createUser = async (
        userData: CreateUserDto,
    ): Promise<UserDto | { message: string } | null> => {
        setLoading(true);
        setError(null);

        try {
            const response = await apiClient.createUser(userData);

            setLoading(false);
            return response;
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error");
            return null;
        } finally {
            setLoading(false);
        }
    };

    return {
        createUser,
        loading,
        error,
    };
};
