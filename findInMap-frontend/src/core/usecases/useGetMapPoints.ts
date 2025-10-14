import { useState, useCallback } from "react";

import { API_URL } from "../../config";
import TokenStorageService from "../../utils/TokenStorageService";
import { type MapPointDto } from "../dtos/MapPointDto";

interface UseGetMapPoints {
    loading: boolean;
    error: any;
    data: MapPointDto[] | null;
    fetch: () => Promise<void>;
    hasFetched: boolean;
}

export const useGetMapPoints = (): UseGetMapPoints => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<any>(null);
    const [data, setData] = useState<MapPointDto[] | null>(null);
    const [hasFetched, setHasFetched] = useState(false);

    const fetchMapPoints = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const accessToken = TokenStorageService.getAccessToken();

            const response = await fetch(`${API_URL}/api/map-points`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result: MapPointDto[] = await response.json();
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
