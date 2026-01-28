import { useIntl } from "react-intl";

import { useApiClient } from "../contexts/ApiClientContext";
import { type CategoryDto } from "../dtos/CategoryDto";
import { useRequestWrapper } from "./utils/useRequestWrapper";

interface UpdateCategoryDto {
    description: string;
    color: string;
}

interface UseUpdateMapCategory {
    loading: boolean;
    error: any;
    updateCategory: (
        groupId: string,
        mapId: string,
        categoryId: string,
        data: UpdateCategoryDto,
    ) => Promise<CategoryDto | null>;
}

export const useUpdateMapCategory = (): UseUpdateMapCategory => {
    const apiClient = useApiClient();
    const intl = useIntl();

    const { fetch, loading, error } = useRequestWrapper(
        (
            groupId: string,
            mapId: string,
            categoryId: string,
            data: UpdateCategoryDto,
        ) => apiClient.updateMapCategory(groupId, mapId, categoryId, data),
        intl.formatMessage({ id: "errors.updateMapCategory" }),
        intl.formatMessage({ id: "messages.categoryUpdatedSuccessfully" }),
    );

    const updateCategory = async (
        groupId: string,
        mapId: string,
        categoryId: string,
        data: UpdateCategoryDto,
    ): Promise<CategoryDto | null> => {
        const response = await fetch(groupId, mapId, categoryId, data);
        return response;
    };

    return {
        loading,
        error,
        updateCategory,
    };
};
