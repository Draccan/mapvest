import { useApiClient } from "../contexts/ApiClientContext";
import { useRequestWrapper } from "./utils/useRequestWrapper";

interface UseDeleteMapPoint {
    loading: boolean;
    error: any;
    deleteMapPoint: (
        groupId: string,
        mapId: string,
        pointIds: string[],
    ) => Promise<void>;
}

export const useDeleteMapPoint = (): UseDeleteMapPoint => {
    const apiClient = useApiClient();

    const { fetch, loading, error } = useRequestWrapper(
        (groupId: string, mapId: string, pointIds: string[]) =>
            apiClient.deleteMapPoint(groupId, mapId, pointIds),
    );

    const deleteMapPoint = async (
        groupId: string,
        mapId: string,
        pointIds: string[],
    ): Promise<void> => {
        await fetch(groupId, mapId, pointIds);
    };

    return {
        loading,
        error,
        deleteMapPoint,
    };
};
