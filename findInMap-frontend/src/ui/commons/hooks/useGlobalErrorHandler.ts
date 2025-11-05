import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import { UnauthorizedError } from "../../../core/api/errors/UnauthorizedError";
import { useApiClient } from "../../../core/contexts/ApiClientContext";
import TokenStorageService from "../../../utils/TokenStorageService";
import routes from "../routes";

// Warning: use of useRef to prevent re-renders.
// Warning: after 2 seconds, the isLoggingOut flag is reset to allow future
// automatic logouts.
export function useGlobalErrorHandler() {
    const navigate = useNavigate();
    const apiClient = useApiClient();
    const isLoggingOut = useRef(false);

    useEffect(() => {
        const handleUnauthorizedError = async (
            event: PromiseRejectionEvent,
        ) => {
            if (event.reason instanceof UnauthorizedError) {
                event.preventDefault();

                const refreshToken = TokenStorageService.getRefreshToken();

                if (isLoggingOut.current || !refreshToken) {
                    navigate(routes.login(), { replace: true });
                    return;
                }

                isLoggingOut.current = true;

                try {
                    await apiClient.logout();
                } catch (err) {
                    console.error("Error during automatic logout:", err);
                } finally {
                    navigate(routes.login(), { replace: true });

                    setTimeout(() => {
                        isLoggingOut.current = false;
                    }, 2000);
                }
            }
        };

        window.addEventListener("unhandledrejection", handleUnauthorizedError);

        return () => {
            window.removeEventListener(
                "unhandledrejection",
                handleUnauthorizedError,
            );
        };
    }, [apiClient, navigate]);
}
