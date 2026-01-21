import { useState } from "react";
import { useIntl } from "react-intl";

import { useApiClient } from "../contexts/ApiClientContext";
import { type PublicMapDto } from "../dtos/PublicMapDto";
import { useRequestWrapper } from "./utils/useRequestWrapper";

interface UseGetPublicMap {
    loading: boolean;
    error: any;
    data: PublicMapDto | null;
    fetch: (publicMapId: string) => Promise<void>;
    hasFetched: boolean;
    reset: () => void;
}

export const useGetPublicMap = (): UseGetPublicMap => {
    const apiClient = useApiClient();
    const intl = useIntl();
    const [data, setData] = useState<PublicMapDto | null>(null);
    const [hasFetched, setHasFetched] = useState(false);

    const { fetch, loading, error } = useRequestWrapper(
        (publicMapId: string) => apiClient.getPublicMap(publicMapId),
        intl.formatMessage({ id: "errors.getPublicMap" }),
    );

    const fetchPublicMap = async (publicMapId: string) => {
        const result: PublicMapDto | null = await fetch(publicMapId);

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
        fetch: fetchPublicMap,
        hasFetched,
        reset,
    };
};
