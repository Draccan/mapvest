import { useIntl } from "react-intl";

import { useApiClient } from "../contexts/ApiClientContext";
import type { UpdateUserInGroupDto } from "../dtos/UpdateUserInGroupDto";
import { useRequestWrapper } from "./utils/useRequestWrapper";

interface UseUpdateUserInGroup {
    loading: boolean;
    error: any;
    updateUserInGroup: (
        groupId: string,
        userId: string,
        data: UpdateUserInGroupDto,
    ) => Promise<void>;
}

export const useUpdateUserInGroup = (): UseUpdateUserInGroup => {
    const apiClient = useApiClient();
    const intl = useIntl();

    const { fetch, loading, error } = useRequestWrapper(
        (groupId: string, userId: string, data: UpdateUserInGroupDto) =>
            apiClient.updateUserInGroup(groupId, userId, data),
        intl.formatMessage({ id: "errors.updateUserInGroup" }),
        intl.formatMessage({ id: "messages.userRoleUpdatedSuccessfully" }),
    );

    const updateUserInGroup = async (
        groupId: string,
        userId: string,
        data: UpdateUserInGroupDto,
    ): Promise<void> => {
        await fetch(groupId, userId, data);
    };

    return {
        loading,
        error,
        updateUserInGroup,
    };
};
