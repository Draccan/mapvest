import { useState } from "react";
import { useIntl } from "react-intl";

import { useApiClient } from "../contexts/ApiClientContext";
import type UserGroupDto from "../dtos/UserGroupDto";
import { useRequestWrapper } from "./utils/useRequestWrapper";

interface UseGetGroupUsers {
    loading: boolean;
    error: any;
    data: UserGroupDto[] | null;
    fetch: (groupId: string) => Promise<void>;
    hasFetched: boolean;
}

export const useGetGroupUsers = (): UseGetGroupUsers => {
    const apiClient = useApiClient();
    const intl = useIntl();
    const [data, setData] = useState<UserGroupDto[] | null>(null);
    const [hasFetched, setHasFetched] = useState(false);

    const { fetch, loading, error } = useRequestWrapper(
        (groupId: string) => apiClient.getGroupUsers(groupId),
        intl.formatMessage({ id: "errors.getGroupUsers" }),
    );

    const fetchGroupUsers = async (groupId: string) => {
        const result: UserGroupDto[] | null = await fetch(groupId);

        if (result) {
            setData(result);
            setHasFetched(true);
        } else {
            setData(null);
        }
    };

    return {
        loading,
        error,
        data,
        fetch: fetchGroupUsers,
        hasFetched,
    };
};
