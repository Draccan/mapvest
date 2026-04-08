import { useIntl } from "react-intl";

import { useApiClient } from "../contexts/ApiClientContext";
import { useRequestWrapper } from "./utils/useRequestWrapper";

interface UseCreateCheckoutSession {
    loading: boolean;
    createCheckoutSession: (groupId: string) => Promise<void>;
}

export const useCreateCheckoutSession = (): UseCreateCheckoutSession => {
    const apiClient = useApiClient();
    const intl = useIntl();

    const { fetch, loading } = useRequestWrapper(
        (groupId: string) => apiClient.createCheckoutSession(groupId),
        intl.formatMessage({ id: "errors.createCheckoutSession" }),
    );

    const createCheckoutSession = async (groupId: string): Promise<void> => {
        const result = await fetch(groupId);
        if (result) {
            window.location.href = result.url;
        }
    };

    return {
        loading,
        createCheckoutSession,
    };
};
