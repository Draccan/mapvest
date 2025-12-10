import { useIntl } from "react-intl";

import { useApiClient } from "../contexts/ApiClientContext";
import { useRequestWrapper } from "./utils/useRequestWrapper";

interface UseUpdateUserPassword {
    updatePassword: (resetToken: string, password: string) => Promise<void>;
    loading: boolean;
    error: string | null;
}

export const useUpdateUserPassword = (): UseUpdateUserPassword => {
    const apiClient = useApiClient();
    const intl = useIntl();

    const { fetch, loading, error } = useRequestWrapper(
        (resetToken: string, password: string) =>
            apiClient.updatePasswordWithResetToken(resetToken, password),
        intl.formatMessage({ id: "errors.updateUserPassword" }),
    );

    const updatePassword = async (
        resetToken: string,
        password: string,
    ): Promise<void> => {
        await fetch(resetToken, password);
    };

    return {
        updatePassword,
        loading,
        error,
    };
};
