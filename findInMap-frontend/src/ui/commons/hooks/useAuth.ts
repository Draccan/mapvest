import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import routes from "../routes";
import TokenStorageService from "../../../utils/TokenStorageService";
import { useRefreshToken } from "../../../core/usecases/useRefreshToken";

interface UseAuth {
    isAuthenticated: boolean;
    isLoading: boolean;
    logout: () => void;
}

export const useAuth = (): UseAuth => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const { refreshToken } = useRefreshToken();
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuthStatus = async () => {
            setIsLoading(true);

            const hasTokens = TokenStorageService.hasValidTokens();

            if (hasTokens) {
                setIsAuthenticated(true);
                setIsLoading(false);
                return;
            }

            const hasRefreshToken = TokenStorageService.hasRefreshToken();

            if (hasRefreshToken) {
                const tokensResponse = await refreshToken();
                setIsAuthenticated(!!tokensResponse);
            } else {
                setIsAuthenticated(false);
            }

            setIsLoading(false);
        };

        checkAuthStatus();
    }, [refreshToken]);

    const logout = () => {
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
