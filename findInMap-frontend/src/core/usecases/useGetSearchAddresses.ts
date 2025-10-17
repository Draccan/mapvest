import debounce from "lodash-es/debounce";
import mem from "mem";
import { useCallback, useMemo, useState } from "react";

import { API_URL } from "../../config";
import TokenStorageService from "../../utils/TokenStorageService";
import type AddressDto from "../dtos/AddressDto";

interface UseGetGooglePlaces {
    results: AddressDto[];
    loading: boolean;
    fetch: (searchQuery: string) => Promise<void>;
    debouncedFetch: (searchQuery: string) => void;
}

const fetchAddressesRequest = async (
    searchQuery: string,
): Promise<AddressDto[]> => {
    const accessToken = TokenStorageService.getAccessToken();

    const response = await fetch(
        `${API_URL}/search/addresses?text=${encodeURIComponent(searchQuery)}`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
        },
    );

    return await response.json();
};

const memoizedFetchAddresses = mem(fetchAddressesRequest, {
    maxAge: 60 * 60 * 1000,
    cacheKey: (query) => query.join().toLowerCase().trim(),
});

export default function useGetGooglePlaces(): UseGetGooglePlaces {
    const [results, setResults] = useState<AddressDto[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchAddresses = useCallback(async (searchQuery: string) => {
        if (searchQuery.length < 3) {
            setResults([]);
            return;
        }

        setLoading(true);
        try {
            const searchResults = await memoizedFetchAddresses(searchQuery);
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
