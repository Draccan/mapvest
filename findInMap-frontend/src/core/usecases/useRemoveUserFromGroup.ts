import { useIntl } from "react-intl";

import { useApiClient } from "../contexts/ApiClientContext";
import { useRequestWrapper } from "./utils/useRequestWrapper";

interface UseRemoveUserFromGroup {
    loading: boolean;
    error: any;
    removeUserFromGroup: (groupId: string, userId: string) => Promise<void>;
}

export const useRemoveUserFromGroup = (): UseRemoveUserFromGroup => {
    const apiClient = useApiClient();
    const intl = useIntl();

    const { fetch, loading, error } = useRequestWrapper(
        (groupId: string, userId: string) =>
            apiClient.removeUserFromGroup(groupId, userId),
        intl.formatMessage({ id: "errors.removeUserFromGroup" }),
        intl.formatMessage({ id: "messages.userRemovedSuccessfully" }),
    );

    const removeUserFromGroup = async (
        groupId: string,
        userId: string,
    ): Promise<void> => {
        await fetch(groupId, userId);
    };

    return {
        loading,
        error,
        removeUserFromGroup,
    };
};
