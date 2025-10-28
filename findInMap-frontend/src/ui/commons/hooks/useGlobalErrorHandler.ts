import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { UnauthorizedError } from "../../../core/api/errors/UnauthorizedError";
import { useApiClient } from "../../../core/contexts/ApiClientContext";
import routes from "../routes";

export function useGlobalErrorHandler() {
    const navigate = useNavigate();
    const apiClient = useApiClient();

    useEffect(() => {
        const handleUnauthorizedError = async (
            event: PromiseRejectionEvent,
        ) => {
            if (event.reason instanceof UnauthorizedError) {
                event.preventDefault();

                try {
                    await apiClient.logout();
                } catch (err) {
                    console.error("Error during automatic logout:", err);
                }

                navigate(routes.login(), { replace: true });
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
