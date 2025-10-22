import debounce from "lodash-es/debounce";
import mem from "mem";
import { useCallback, useMemo, useState } from "react";

import type ApiClient from "../ApiClient";
import { useApiClient } from "../contexts/ApiClientContext";
import type AddressDto from "../dtos/AddressDto";

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
    const [results, setResults] = useState<AddressDto[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchAddresses = useCallback(async (searchQuery: string) => {
        if (searchQuery.length < 3) {
            setResults([]);
            return;
        }

        setLoading(true);
        try {
            const searchResults = await memoizedFetchAddresses(
                apiClient,
                searchQuery,
            );
            setResults(searchResults);
        } catch (error) {
            console.error("Address search error:", error);
            setResults([]);
        } finally {
            setLoading(false);
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
