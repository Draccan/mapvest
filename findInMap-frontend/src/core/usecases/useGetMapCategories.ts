import { useState } from "react";
import { useIntl } from "react-intl";

import { useApiClient } from "../contexts/ApiClientContext";
import { type CategoryDto } from "../dtos/CategoryDto";
import { useRequestWrapper } from "./utils/useRequestWrapper";

interface UseGetMapCategories {
    loading: boolean;
    error: any;
    data: CategoryDto[] | null;
    fetch: (groupId: string, mapId: string) => Promise<void>;
    hasFetched: boolean;
    reset: () => void;
}

export const useGetMapCategories = (): UseGetMapCategories => {
    const apiClient = useApiClient();
    const intl = useIntl();
    const [data, setData] = useState<CategoryDto[] | null>(null);
    const [hasFetched, setHasFetched] = useState(false);

    const { fetch, loading, error } = useRequestWrapper(
        (groupId: string, mapId: string) =>
            apiClient.getMapCategories(groupId, mapId),
        intl.formatMessage({ id: "errors.getMapCategories" }),
    );

    const fetchMapCategories = async (groupId: string, mapId: string) => {
        const result: CategoryDto[] | null = await fetch(groupId, mapId);

        if (result) {
            setData(result);
            setHasFetched(true);
        } else {
            setData(null);
        }
    };

    const reset = () => {
        setData(null);
        setHasFetched(false);
    };

    return {
        loading,
        error,
        data,
        fetch: fetchMapCategories,
        hasFetched,
        reset,
    };
};
