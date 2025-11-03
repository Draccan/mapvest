import { useApiClient } from "../contexts/ApiClientContext";
import { type CreateMapPointDto } from "../dtos/CreateMapPointDto";
import type { MapPointDto } from "../dtos/MapPointDto";
import { useRequestWrapper } from "./utils/useRequestWrapper";

interface UseCreateMapPoint {
    loading: boolean;
    error: any;
    createMapPoint: (
        groupId: string,
        mapId: string,
        data: CreateMapPointDto,
    ) => Promise<MapPointDto | null>;
}

export const useCreateMapPoint = (): UseCreateMapPoint => {
    const apiClient = useApiClient();

    const { fetch, loading, error } = useRequestWrapper(
        (groupId: string, mapId: string, data: CreateMapPointDto) =>
            apiClient.createMapPointInMap(groupId, mapId, data),
    );

    const createMapPoint = async (
        groupId: string,
        mapId: string,
        data: CreateMapPointDto,
    ): Promise<MapPointDto | null> => {
        const response = await fetch(groupId, mapId, data);
        return response;
    };

    return {
        loading,
        error,
        createMapPoint,
    };
};
