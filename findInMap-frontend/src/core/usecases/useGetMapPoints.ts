import { useState } from "react";
import { useIntl } from "react-intl";

import { useApiClient } from "../contexts/ApiClientContext";
import { type MapPointDto } from "../dtos/MapPointDto";
import { useRequestWrapper } from "./utils/useRequestWrapper";

interface UseGetMapPoints {
    loading: boolean;
    error: any;
    data: MapPointDto[] | null;
    fetch: (groupId: string, mapId: string) => Promise<void>;
    hasFetched: boolean;
    reset: () => void;
}

export const useGetMapPoints = (): UseGetMapPoints => {
    const apiClient = useApiClient();
    const intl = useIntl();
    const [data, setData] = useState<MapPointDto[] | null>(null);
    const [hasFetched, setHasFetched] = useState(false);

    const { fetch, loading, error } = useRequestWrapper(
        (groupId: string, mapId: string) =>
            apiClient.getMapPointsByMap(groupId, mapId),
        intl.formatMessage({ id: "errors.getMapPoints" }),
    );

    const fetchMapPoints = async (groupId: string, mapId: string) => {
        const result: MapPointDto[] | null = await fetch(groupId, mapId);

        if (result) {
            setData(result);
            setHasFetched(true);
        } else {
            setData(null);
        }
    };

    const reset = () => {
        setData(null);
        setHasFetched(false);
    };

    return {
        loading,
        error,
        data,
        fetch: fetchMapPoints,
        hasFetched,
        reset,
    };
};
