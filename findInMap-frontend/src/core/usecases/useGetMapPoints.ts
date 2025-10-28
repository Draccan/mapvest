import { useState } from "react";

import { useApiClient } from "../contexts/ApiClientContext";
import { type MapPointDto } from "../dtos/MapPointDto";
import { useRequestWrapper } from "./utils/useRequestWrapper";

interface UseGetMapPoints {
    loading: boolean;
    error: any;
    data: MapPointDto[] | null;
    fetch: () => Promise<void>;
    hasFetched: boolean;
}

export const useGetMapPoints = (): UseGetMapPoints => {
    const apiClient = useApiClient();
    const [data, setData] = useState<MapPointDto[] | null>(null);
    const [hasFetched, setHasFetched] = useState(false);

    const { fetch, loading, error } = useRequestWrapper(() =>
        apiClient.getMapPoints(),
    );

    const fetchMapPoints = async () => {
        const result: MapPointDto[] | null = await fetch();

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
        fetch: fetchMapPoints,
        hasFetched,
    };
};
