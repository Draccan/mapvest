import { useIntl } from "react-intl";

import { useApiClient } from "../contexts/ApiClientContext";
import type { MapPointDto } from "../dtos/MapPointDto";
import type { UpdateMapPointDto } from "../dtos/UpdateMapPointDto";
import { useRequestWrapper } from "./utils/useRequestWrapper";

interface UseUpdateMapPoint {
    loading: boolean;
    error: any;
    updateMapPoint: (
        groupId: string,
        mapId: string,
        pointId: string,
        data: UpdateMapPointDto,
    ) => Promise<MapPointDto | null>;
}

export const useUpdateMapPoint = (): UseUpdateMapPoint => {
    const apiClient = useApiClient();
    const intl = useIntl();

    const { fetch, loading, error } = useRequestWrapper(
        (
            groupId: string,
            mapId: string,
            pointId: string,
            data: UpdateMapPointDto,
        ) => apiClient.updateMapPoint(groupId, mapId, pointId, data),
        intl.formatMessage({ id: "errors.updateMapPoint" }),
    );

    const updateMapPoint = async (
        groupId: string,
        mapId: string,
        pointId: string,
        data: UpdateMapPointDto,
    ): Promise<MapPointDto | null> => {
        const response = await fetch(groupId, mapId, pointId, data);
        return response;
    };

    return {
        loading,
        error,
        updateMapPoint,
    };
};
