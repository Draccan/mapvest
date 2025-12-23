import { useIntl } from "react-intl";

import { useApiClient } from "../contexts/ApiClientContext";
import type { CreateMapDto } from "../dtos/CreateMapDto";
import type { MapDto } from "../dtos/MapDto";
import { useRequestWrapper } from "./utils/useRequestWrapper";

interface UseCreateMap {
    loading: boolean;
    error: any;
    createMap: (groupId: string, data: CreateMapDto) => Promise<MapDto | null>;
}

export const useCreateMap = (): UseCreateMap => {
    const apiClient = useApiClient();
    const intl = useIntl();

    const { fetch, loading, error } = useRequestWrapper(
        (groupId: string, data: CreateMapDto) =>
            apiClient.createMap(groupId, data),
        intl.formatMessage({ id: "errors.createMap" }),
    );

    const createMap = async (
        groupId: string,
        data: CreateMapDto,
    ): Promise<MapDto | null> => {
        const response = await fetch(groupId, data);
        return response;
    };

    return {
        loading,
        error,
        createMap,
    };
};
