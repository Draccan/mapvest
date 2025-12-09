import { useIntl } from "react-intl";

import { useApiClient } from "../contexts/ApiClientContext";
import { useRequestWrapper } from "./utils/useRequestWrapper";

interface UseResetPassword {
    resetPassword: (email: string) => Promise<void>;
    loading: boolean;
    error: string | null;
}

export const useResetPassword = (): UseResetPassword => {
    const apiClient = useApiClient();
    const intl = useIntl();

    const { fetch, loading, error } = useRequestWrapper(
        (email: string) => apiClient.resetPassword(email),
        intl.formatMessage({ id: "errors.resetPassword" }),
    );

    const resetPassword = async (email: string): Promise<void> => {
        await fetch(email);
    };

    return {
        resetPassword,
        loading,
        error,
    };
};
