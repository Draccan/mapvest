import { useState } from "react";

import { API_URL } from "../../config";
import TokenStorageService from "../../utils/TokenStorageService";

interface UseLogoutUser {
    logout: () => Promise<void>;
    loading: boolean;
    error: string | null;
}

export const useLogoutUser = (): UseLogoutUser => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<any>();

    const logout = async (): Promise<void> => {
        setLoading(true);
        setError(null);

        try {
            const refreshToken = TokenStorageService.getRefreshToken();
            if (!refreshToken) {
                return;
            }

            await fetch(`${API_URL}/users/logout`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${refreshToken}`,
                },
            });
        } catch (err) {
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
