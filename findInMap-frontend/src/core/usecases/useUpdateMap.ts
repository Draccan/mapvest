import { useIntl } from "react-intl";

import { useApiClient } from "../contexts/ApiClientContext";
import type { MapDto } from "../dtos/MapDto";
import type { UpdateMapDto } from "../dtos/UpdateMapDto";
import { useRequestWrapper } from "./utils/useRequestWrapper";

interface UseUpdateMap {
    loading: boolean;
    error: any;
    updateMap: (
        groupId: string,
        mapId: string,
        data: UpdateMapDto,
    ) => Promise<MapDto | null>;
}

export const useUpdateMap = (): UseUpdateMap => {
    const apiClient = useApiClient();
    const intl = useIntl();

    const { fetch, loading, error } = useRequestWrapper(
        (groupId: string, mapId: string, data: UpdateMapDto) =>
            apiClient.updateMap(groupId, mapId, data),
        intl.formatMessage({ id: "errors.updateMap" }),
    );

    const updateMap = async (
        groupId: string,
        mapId: string,
        data: UpdateMapDto,
    ): Promise<MapDto | null> => {
        const response = await fetch(groupId, mapId, data);
        return response;
    };

    return {
        loading,
        error,
        updateMap,
    };
};
