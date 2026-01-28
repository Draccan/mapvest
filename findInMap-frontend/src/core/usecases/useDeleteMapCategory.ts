import { useIntl } from "react-intl";

import { useApiClient } from "../contexts/ApiClientContext";
import { useRequestWrapper } from "./utils/useRequestWrapper";

interface UseDeleteMapCategory {
    loading: boolean;
    error: any;
    deleteCategory: (
        groupId: string,
        mapId: string,
        categoryId: string,
    ) => Promise<boolean>;
}

export const useDeleteMapCategory = (): UseDeleteMapCategory => {
    const apiClient = useApiClient();
    const intl = useIntl();

    const { fetch, loading, error } = useRequestWrapper(
        (groupId: string, mapId: string, categoryId: string) =>
            apiClient.deleteMapCategory(groupId, mapId, categoryId),
        intl.formatMessage({ id: "errors.deleteMapCategory" }),
        intl.formatMessage({ id: "messages.categoryDeletedSuccessfully" }),
    );

    const deleteCategory = async (
        groupId: string,
        mapId: string,
        categoryId: string,
    ): Promise<boolean> => {
        const result = await fetch(groupId, mapId, categoryId);
        return result !== null;
    };

    return {
        loading,
        error,
        deleteCategory,
    };
};