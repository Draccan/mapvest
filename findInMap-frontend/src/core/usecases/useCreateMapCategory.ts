import { useApiClient } from "../contexts/ApiClientContext";
import { type CategoryDto } from "../dtos/CategoryDto";
import { useRequestWrapper } from "./utils/useRequestWrapper";

interface CreateCategoryDto {
    description: string;
    color: string;
}

interface UseCreateMapCategory {
    loading: boolean;
    error: any;
    createCategory: (
        groupId: string,
        mapId: string,
        data: CreateCategoryDto,
    ) => Promise<CategoryDto | null>;
}

export const useCreateMapCategory = (): UseCreateMapCategory => {
    const apiClient = useApiClient();

    const { fetch, loading, error } = useRequestWrapper(
        (groupId: string, mapId: string, data: CreateCategoryDto) =>
            apiClient.createMapCategory(groupId, mapId, data),
    );

    const createCategory = async (
        groupId: string,
        mapId: string,
        data: CreateCategoryDto,
    ): Promise<CategoryDto | null> => {
        const response = await fetch(groupId, mapId, data);
        return response;
    };

    return {
        loading,
        error,
        createCategory,
    };
};
