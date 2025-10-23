import { useApiClient } from "../contexts/ApiClientContext";
import { type CreateMapPointDto } from "../dtos/CreateMapPointDto";
import type { MapPointDto } from "../dtos/MapPointDto";
import { useRequestWrapper } from "./utils/useRequestWrapper";

interface UseCreateMapPoint {
    loading: boolean;
    error: any;
    createMapPoint: (data: CreateMapPointDto) => Promise<MapPointDto | null>;
}

export const useCreateMapPoint = (): UseCreateMapPoint => {
    const apiClient = useApiClient();

    const { fetch, loading, error } = useRequestWrapper(
        (data: CreateMapPointDto) => apiClient.createMapPoint(data),
    );

    const createMapPoint = async (
        data: CreateMapPointDto,
    ): Promise<MapPointDto | null> => {
        const response = await fetch(data);
        return response;
    };

    return {
        loading,
        error,
        createMapPoint,
    };
};
