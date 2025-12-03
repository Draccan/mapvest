import { useState } from "react";
import { useIntl } from "react-intl";

import { useApiClient } from "../contexts/ApiClientContext";
import { type GroupDto } from "../dtos/GroupDto";
import { useRequestWrapper } from "./utils/useRequestWrapper";

interface UseGetUserGroups {
    loading: boolean;
    error: any;
    data: GroupDto[] | null;
    fetch: () => Promise<void>;
    hasFetched: boolean;
}

export const useGetUserGroups = (): UseGetUserGroups => {
    const apiClient = useApiClient();
    const intl = useIntl();
    const [data, setData] = useState<GroupDto[] | null>(null);
    const [hasFetched, setHasFetched] = useState(false);

    const { fetch, loading, error } = useRequestWrapper(
        () => apiClient.getUserGroups(),
        intl.formatMessage({ id: "errors.getUserGroups" }),
    );

    const fetchUserGroups = async () => {
        const result: GroupDto[] | null = await fetch();

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
        fetch: fetchUserGroups,
        hasFetched,
    };
};
