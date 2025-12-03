import { useState } from "react";
import { useIntl } from "react-intl";

import { useApiClient } from "../contexts/ApiClientContext";
import { type MapDto } from "../dtos/MapDto";
import { useRequestWrapper } from "./utils/useRequestWrapper";

interface UseGetGroupMaps {
    loading: boolean;
    error: any;
    data: MapDto[] | null;
    fetch: (groupId: string) => Promise<void>;
    hasFetched: boolean;
}

export const useGetGroupMaps = (): UseGetGroupMaps => {
    const apiClient = useApiClient();
    const intl = useIntl();
    const [data, setData] = useState<MapDto[] | null>(null);
    const [hasFetched, setHasFetched] = useState(false);

    const { fetch, loading, error } = useRequestWrapper(
        (groupId: string) => apiClient.getGroupMaps(groupId),
        intl.formatMessage({ id: "errors.getGroupMaps" }),
    );

    const fetchGroupMaps = async (groupId: string) => {
        const result: MapDto[] | null = await fetch(groupId);

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
        fetch: fetchGroupMaps,
        hasFetched,
    };
};
