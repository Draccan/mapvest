import React, { useState, useMemo } from "react";
import { OpenStreetMapProvider } from "leaflet-geosearch";
import { debounce } from "lodash-es";

import { setMultipleClassNames } from "../../utils/setMultipleClassNames";
import "./style.css";

interface AddressSearchProps {
    onAddressSelect: (lat: number, lng: number) => void;
    className?: string;
}

interface SearchResult {
    x: number;
    y: number;
    label: string;
}

export const AddressSearch: React.FC<AddressSearchProps> = ({
    onAddressSelect,
    className = "",
}) => {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);

    const provider = useMemo(
        () =>
            new OpenStreetMapProvider({
                params: {
                    format: "json",
                    addressdetails: 1,
                    limit: 5,
                    "accept-language": "it,en",
                    extratags: 1,
                    namedetails: 1,
                },
            }),
        [],
    );

    // TODO capire se può essere uno usecase o un hook + vedere tutto il nuovo codice
    // e pulirlo + Capire se usare come suggerito anche @googlemaps/js-api-loader
    // che ha più dati. Altrimenti Via/Viale Degli Olmi 18, Senigallia non lo trova..
    const debouncedSearchAddress = useMemo(() => {
        const searchAddress = async (searchQuery: string) => {
            if (searchQuery.length < 3) {
                setResults([]);
                setShowResults(false);
                return;
            }

            setLoading(true);
            try {
                const searchResults = await provider.search({
                    query: searchQuery,
                });
                const formattedResults: SearchResult[] = searchResults
                    .slice(0, 5)
                    .map((result) => ({
                        x: result.x,
                        y: result.y,
                        label: result.label,
                    }));

                setResults(formattedResults);
                setShowResults(true);
            } catch (error) {
                console.error("Address search error:", error);
                setResults([]);
            } finally {
                setLoading(false);
            }
        };

        return debounce(searchAddress, 300);
    }, [provider]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);

        debouncedSearchAddress(value);
    };

    const handleResultSelect = (result: SearchResult) => {
        setQuery(result.label);
        setShowResults(false);
        onAddressSelect(result.y, result.x);
    };

    const classNames = setMultipleClassNames("c-address-search", className);

    return (
        <div className={classNames}>
            <div className="c-address-search-input-wrapper">
                <input
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    placeholder="Search address..."
                    className="c-address-search-input"
                    onFocus={() => setShowResults(results.length > 0)}
                    onBlur={() => setTimeout(() => setShowResults(false), 200)}
                />

                {loading && (
                    <div className="c-address-search-spinner-container">
                        <div className="c-address-search-spinner"></div>
                    </div>
                )}

                <div className="c-address-search-icon">🔍</div>
            </div>

            {showResults && results.length > 0 && (
                <div className="c-address-search-results">
                    {results.map((result, index) => (
                        <button
                            key={index}
                            className="c-address-search-result"
                            onMouseDown={() => handleResultSelect(result)}
                        >
                            <span className="c-address-search-result-icon">
                                📍
                            </span>
                            <span className="c-address-search-result-text">
                                {result.label}
                            </span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
