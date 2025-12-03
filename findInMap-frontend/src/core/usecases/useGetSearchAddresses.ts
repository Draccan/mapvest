import debounce from "lodash-es/debounce";
import mem from "mem";
import { useCallback, useMemo, useState } from "react";
import { useIntl } from "react-intl";

import type ApiClient from "../api/ApiClient";
import { useApiClient } from "../contexts/ApiClientContext";
import type AddressDto from "../dtos/AddressDto";
import { useRequestWrapper } from "./utils/useRequestWrapper";

interface UseGetGooglePlaces {
    results: AddressDto[];
    loading: boolean;
    fetch: (searchQuery: string) => Promise<void>;
    debouncedFetch: (searchQuery: string) => void;
}

const fetchAddressesRequest = async (
    apiClient: ApiClient,
    searchQuery: string,
): Promise<AddressDto[]> => {
    return await apiClient.searchAddresses(searchQuery);
};

const memoizedFetchAddresses = mem(fetchAddressesRequest, {
    maxAge: 60 * 60 * 1000,
    cacheKey: (query) => query.join().toLowerCase().trim(),
});

export default function useGetGooglePlaces(): UseGetGooglePlaces {
    const apiClient = useApiClient();
    const intl = useIntl();
    const [results, setResults] = useState<AddressDto[]>([]);

    const { fetch, loading } = useRequestWrapper(
        (searchQuery: string) => memoizedFetchAddresses(apiClient, searchQuery),
        intl.formatMessage({ id: "errors.getSearchAddresses" }),
    );

    const fetchAddresses = useCallback(async (searchQuery: string) => {
        if (searchQuery.length < 3) {
            setResults([]);
            return;
        }

        const result = await fetch(searchQuery);
        if (result) {
            setResults(result);
        } else {
            setResults([]);
        }
    }, []);

    const debouncedFetch = useMemo(
        () => debounce(fetchAddresses, 300),
        [fetchAddresses],
    );

    return {
        results,
        loading,
        fetch: fetchAddresses,
        debouncedFetch,
    };
}
