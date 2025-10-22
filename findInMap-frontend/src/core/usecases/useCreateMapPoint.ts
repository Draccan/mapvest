import { useState, useCallback } from "react";

import { useApiClient } from "../contexts/ApiClientContext";
import { type CreateMapPointDto } from "../dtos/CreateMapPointDto";
import type { MapPointDto } from "../dtos/MapPointDto";

interface UseCreateMapPoint {
    loading: boolean;
    error: any;
    createMapPoint: (data: CreateMapPointDto) => Promise<MapPointDto | null>;
}

export const useCreateMapPoint = (): UseCreateMapPoint => {
    const apiClient = useApiClient();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<any>(null);

    const createMapPoint = useCallback(
        async (data: CreateMapPointDto): Promise<MapPointDto | null> => {
            try {
                setLoading(true);
                setError(null);

                const response = await apiClient.createMapPoint(data);
                return response;
            } catch (err) {
                setError(err);
                return null;
            } finally {
                setLoading(false);
            }
        },
        [],
    );

    return {
        loading,
        error,
        createMapPoint,
    };
};
