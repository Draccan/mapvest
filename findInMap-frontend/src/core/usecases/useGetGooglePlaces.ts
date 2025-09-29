import debounce from "lodash-es/debounce";
import mem from "mem";
import { useCallback, useMemo, useState } from "react";

interface SearchResult {
    x: number;
    y: number;
    label: string;
}

interface UseGetGooglePlaces {
    results: SearchResult[];
    loading: boolean;
    fetch: (searchQuery: string) => Promise<void>;
    debouncedFetch: (searchQuery: string) => void;
}

const searchGooglePlaces = async (
    searchQuery: string,
): Promise<SearchResult[]> => {
    const request = {
        textQuery: searchQuery,
        fields: ["displayName", "location", "formattedAddress"],
        language: "it",
        maxResultCount: 10,
    };

    const { places } = await google.maps.places.Place.searchByText(request);

    return places.map((place) => ({
        x: place.location!.lng(),
        y: place.location!.lat(),
        label: place.formattedAddress || place.displayName || searchQuery,
    }));
};

const memoizedSearchGooglePlaces = mem(searchGooglePlaces, {
    maxAge: 60 * 60 * 1000,
    cacheKey: (query) => query.join().toLowerCase().trim(),
});

export default function useGetGooglePlaces(): UseGetGooglePlaces {
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchGooglePlaces = useCallback(async (searchQuery: string) => {
        if (searchQuery.length < 5) {
            setResults([]);
            return;
        }

        setLoading(true);
        try {
            const searchResults = await memoizedSearchGooglePlaces(searchQuery);
            setResults(searchResults);
        } catch (error) {
            console.error("Address search error:", error);
            setResults([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const debouncedFetch = useMemo(
        () => debounce(fetchGooglePlaces, 300),
        [fetchGooglePlaces],
    );

    return {
        results,
        loading,
        fetch: fetchGooglePlaces,
        debouncedFetch,
    };
}
