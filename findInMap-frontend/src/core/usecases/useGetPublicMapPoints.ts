import { useState } from "react";
import { useIntl } from "react-intl";

import { useApiClient } from "../contexts/ApiClientContext";
import { type MapPointDto } from "../dtos/MapPointDto";
import { useRequestWrapper } from "./utils/useRequestWrapper";

interface UseGetPublicMapPoints {
    loading: boolean;
    error: any;
    data: MapPointDto[] | null;
    fetch: (publicMapId: string) => Promise<void>;
    hasFetched: boolean;
    reset: () => void;
}

export const useGetPublicMapPoints = (): UseGetPublicMapPoints => {
    const apiClient = useApiClient();
    const intl = useIntl();
    const [data, setData] = useState<MapPointDto[] | null>(null);
    const [hasFetched, setHasFetched] = useState(false);

    const { fetch, loading, error } = useRequestWrapper(
        (publicMapId: string) => apiClient.getPublicMapPoints(publicMapId),
        intl.formatMessage({ id: "errors.getPublicMapPoints" }),
    );

    const fetchPublicMapPoints = async (publicMapId: string) => {
        const result: MapPointDto[] | null = await fetch(publicMapId);

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
        fetch: fetchPublicMapPoints,
        hasFetched,
        reset,
    };
};
