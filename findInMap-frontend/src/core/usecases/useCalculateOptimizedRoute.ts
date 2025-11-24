import { useState } from "react";

import { useApiClient } from "../contexts/ApiClientContext";
import type { MapPointDto } from "../dtos/MapPointDto";
import type { RouteDto } from "../dtos/RouteDto";
import { useRequestWrapper } from "./utils/useRequestWrapper";

interface useCalculateOptimizedRouteResult {
    calculateOptimizedRoute: (
        startPoint: MapPointDto,
        destinations: MapPointDto[],
        endPoint: MapPointDto,
    ) => Promise<void>;
    data: RouteDto | null;
    hasFetched: boolean;
    loading: boolean;
    error: any;
    reset: () => void;
}

export function useCalculateOptimizedRoute(): useCalculateOptimizedRouteResult {
    const apiClient = useApiClient();
    const [data, setData] = useState<RouteDto | null>(null);
    const [hasFetched, setHasFetched] = useState(false);

    const { fetch, loading, error } = useRequestWrapper(
        (mapPoints: MapPointDto[]) =>
            apiClient.calculateOptimizedRoute(mapPoints),
    );

    const calculateOptimizedRoute = async (
        startPoint: MapPointDto,
        destinations: MapPointDto[],
        endPoint: MapPointDto,
    ): Promise<void> => {
        const mapPoints = [startPoint, ...destinations, endPoint];
        const response = await fetch(mapPoints);

        if (response) {
            setData(response);
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
        calculateOptimizedRoute,
        data,
        hasFetched,
        loading,
        error,
        reset,
    };
}
