import { useApiClient } from "../contexts/ApiClientContext";
import { useRequestWrapper } from "./utils/useRequestWrapper";

interface UseDeleteMapPoint {
    loading: boolean;
    error: any;
    deleteMapPoints: (
        groupId: string,
        mapId: string,
        pointIds: string[],
    ) => Promise<void>;
}

export const useDeleteMapPoints = (): UseDeleteMapPoint => {
    const apiClient = useApiClient();

    const { fetch, loading, error } = useRequestWrapper(
        (groupId: string, mapId: string, pointIds: string[]) =>
            apiClient.deleteMapPoints(groupId, mapId, pointIds),
    );

    const deleteMapPoints = async (
        groupId: string,
        mapId: string,
        pointIds: string[],
    ): Promise<void> => {
        await fetch(groupId, mapId, pointIds);
    };

    return {
        loading,
        error,
        deleteMapPoints,
    };
};
