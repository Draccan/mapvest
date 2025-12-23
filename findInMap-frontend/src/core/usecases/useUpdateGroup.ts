import { useIntl } from "react-intl";

import { useApiClient } from "../contexts/ApiClientContext";
import type { GroupDto } from "../dtos/GroupDto";
import type { UpdateGroupDto } from "../dtos/UpdateGroupDto";
import { useRequestWrapper } from "./utils/useRequestWrapper";

interface UseUpdateGroup {
    loading: boolean;
    error: any;
    updateGroup: (
        groupId: string,
        data: UpdateGroupDto,
    ) => Promise<GroupDto | null>;
}

export const useUpdateGroup = (): UseUpdateGroup => {
    const apiClient = useApiClient();
    const intl = useIntl();

    const { fetch, loading, error } = useRequestWrapper(
        (groupId: string, data: UpdateGroupDto) =>
            apiClient.updateGroup(groupId, data),
        intl.formatMessage({ id: "errors.updateGroup" }),
    );

    const updateGroup = async (
        groupId: string,
        data: UpdateGroupDto,
    ): Promise<GroupDto | null> => {
        const response = await fetch(groupId, data);
        return response;
    };

    return {
        loading,
        error,
        updateGroup,
    };
};
