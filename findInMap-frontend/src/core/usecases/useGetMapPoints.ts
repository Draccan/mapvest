import { useState, useCallback } from "react";

import { useApiClient } from "../contexts/ApiClientContext";
import { type MapPointDto } from "../dtos/MapPointDto";

interface UseGetMapPoints {
    loading: boolean;
    error: any;
    data: MapPointDto[] | null;
    fetch: () => Promise<void>;
    hasFetched: boolean;
}

export const useGetMapPoints = (): UseGetMapPoints => {
    const apiClient = useApiClient();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<any>(null);
    const [data, setData] = useState<MapPointDto[] | null>(null);
    const [hasFetched, setHasFetched] = useState(false);

    const fetchMapPoints = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const result: MapPointDto[] = await apiClient.getMapPoints();

            setData(result);
            setHasFetched(true);
        } catch (err) {
            setError(err);
            setData(null);
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        error,
        data,
        fetch: fetchMapPoints,
        hasFetched,
    };
};
