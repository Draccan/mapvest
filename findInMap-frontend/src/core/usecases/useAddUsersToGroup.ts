import { useIntl } from "react-intl";

import { useApiClient } from "../contexts/ApiClientContext";
import { useRequestWrapper } from "./utils/useRequestWrapper";

interface UseAddUsersToGroup {
    loading: boolean;
    error: any;
    addUsersToGroup: (groupId: string, userEmails: string[]) => Promise<void>;
}

export const useAddUsersToGroup = (): UseAddUsersToGroup => {
    const apiClient = useApiClient();
    const intl = useIntl();

    const { fetch, loading, error } = useRequestWrapper(
        (groupId: string, userEmails: string[]) =>
            apiClient.addUsersToGroup(groupId, userEmails),
        intl.formatMessage({ id: "errors.addUsersToGroup" }),
        intl.formatMessage({ id: "messages.userAddedSuccessfully" }),
    );

    const addUsersToGroup = async (
        groupId: string,
        userEmails: string[],
    ): Promise<void> => {
        await fetch(groupId, userEmails);
    };

    return {
        loading,
        error,
        addUsersToGroup,
    };
};
