import { useState } from "react";

import { API_URL } from "../../config";
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
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createUser = async (
        userData: CreateUserDto,
    ): Promise<UserDto | { message: string } | null> => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_URL}/users`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(userData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to create user");
            }

            setLoading(false);
            return response.json();
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
