import { Search, MapPin } from "lucide-react";
import React, { useEffect, useState } from "react";

import type AddressDto from "../../../core/dtos/AddressDto";
import useGetSearchAddresses from "../../../core/usecases/useGetSearchAddresses";
import { setMultipleClassNames } from "../../utils/setMultipleClassNames";
import "./style.css";

interface AddressSearchProps {
    onAddressSelect: (lat: number, lng: number) => void;
    className?: string;
}

export const AddressSearch: React.FC<AddressSearchProps> = ({
    onAddressSelect,
    className = "",
}) => {
    const [query, setQuery] = useState("");
    const [showResults, setShowResults] = useState(false);
    const { debouncedFetch, loading, results } = useGetSearchAddresses();

    useEffect(() => {
        setShowResults(results.length > 0);
    }, [results]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);
        debouncedFetch(value);
    };

    const handleResultSelect = (result: AddressDto) => {
        setQuery(result.label);
        setShowResults(false);
        onAddressSelect(result.long, result.lat);
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

                <div className="c-address-search-icon">
                    <Search size={18} />
                </div>
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
                                <MapPin size={16} />
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
