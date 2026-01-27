import { useIntl } from "react-intl";

import { useApiClient } from "../contexts/ApiClientContext";
import { useRequestWrapper } from "./utils/useRequestWrapper";

interface UseDeleteMap {
    loading: boolean;
    error: any;
    deleteMap: (groupId: string, mapId: string) => Promise<boolean>;
}

export const useDeleteMap = (): UseDeleteMap => {
    const apiClient = useApiClient();
    const intl = useIntl();

    const { fetch, loading, error } = useRequestWrapper(
        (groupId: string, mapId: string) => apiClient.deleteMap(groupId, mapId),
        intl.formatMessage({ id: "errors.deleteMap" }),
        intl.formatMessage({ id: "messages.mapDeletedSuccessfully" }),
    );

    const deleteMap = async (
        groupId: string,
        mapId: string,
    ): Promise<boolean> => {
        const result = await fetch(groupId, mapId);
        return result !== null;
    };

    return {
        loading,
        error,
        deleteMap,
    };
};