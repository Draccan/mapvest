import { useState } from "react";

import { UnauthorizedError } from "../api/errors/UnauthorizedError";
import { useApiClient } from "../contexts/ApiClientContext";

interface UseLogoutUser {
    logout: () => Promise<void>;
    loading: boolean;
    error: string | null;
}

export const useLogoutUser = (): UseLogoutUser => {
    const apiClient = useApiClient();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<any>();

    const logout = async (): Promise<void> => {
        setLoading(true);
        setError(null);

        try {
            await apiClient.logout();
        } catch (err) {
            if (err instanceof UnauthorizedError) {
                throw err;
            }
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    return {
        logout,
        loading,
        error,
    };
};
