import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import routes from "../routes";
import TokenStorageService from "../../../utils/TokenStorageService";
import { useRefreshToken } from "../../../core/usecases/useRefreshToken";
import { useLogoutUser } from "../../../core/usecases/useLogoutUser";

interface UseAuth {
    isAuthenticated: boolean;
    isLoading: boolean;
    logout: () => void;
}

export const useAuth = (): UseAuth => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const { refreshToken } = useRefreshToken();
    const { logout: logoutUser } = useLogoutUser();
    const navigate = useNavigate();
    // Use a ref to prevent multiple simultaneous refresh attempts
    const isRefreshingRef = useRef(false);

    useEffect(() => {
        const checkAuthStatus = async () => {
            if (isRefreshingRef.current) return;

            setIsLoading(true);

            const hasTokens = TokenStorageService.hasValidTokens();

            if (hasTokens) {
                setIsAuthenticated(true);
                setIsLoading(false);
                return;
            }

            const hasRefreshToken = TokenStorageService.hasRefreshToken();

            if (hasRefreshToken) {
                try {
                    isRefreshingRef.current = true;
                    const tokensResponse = await refreshToken();
                    setIsAuthenticated(!!tokensResponse);
                } finally {
                    isRefreshingRef.current = false;
                }
            } else {
                setIsAuthenticated(false);
            }

            setIsLoading(false);
        };

        checkAuthStatus();
    }, [refreshToken]);

    const logout = async () => {
        await logoutUser();
        TokenStorageService.clearTokens();
        setIsAuthenticated(false);
        navigate(routes.login());
    };

    return {
        isAuthenticated,
        isLoading,
        logout,
    };
};
