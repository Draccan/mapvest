import { useState } from "react";
import { useIntl } from "react-intl";

import { useApiClient } from "../contexts/ApiClientContext";
import { type CategoryDto } from "../dtos/CategoryDto";
import { useRequestWrapper } from "./utils/useRequestWrapper";

interface UseGetPublicMapCategories {
    loading: boolean;
    error: any;
    data: CategoryDto[] | null;
    fetch: (publicMapId: string) => Promise<void>;
    hasFetched: boolean;
    reset: () => void;
}

export const useGetPublicMapCategories = (): UseGetPublicMapCategories => {
    const apiClient = useApiClient();
    const intl = useIntl();
    const [data, setData] = useState<CategoryDto[] | null>(null);
    const [hasFetched, setHasFetched] = useState(false);

    const { fetch, loading, error } = useRequestWrapper(
        (publicMapId: string) => apiClient.getPublicMapCategories(publicMapId),
        intl.formatMessage({ id: "errors.getPublicMapCategories" }),
    );

    const fetchPublicMapCategories = async (publicMapId: string) => {
        const result: CategoryDto[] | null = await fetch(publicMapId);

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
        fetch: fetchPublicMapCategories,
        hasFetched,
        reset,
    };
};
