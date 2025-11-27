import { ChevronDown } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";

import "./style.css";

export interface SelectOption {
    value: string;
    label: string;
    prefixComponent?: React.ReactNode;
}

interface SelectProps {
    id?: string;
    value: string;
    options: SelectOption[];
    placeholder?: string;
    onChange: (value: string) => void;
    className?: string;
}

export const Select: React.FC<SelectProps> = ({
    id,
    value,
    options,
    placeholder,
    onChange,
    className = "",
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find((opt) => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                selectRef.current &&
                !selectRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (optionValue: string) => {
        onChange(optionValue);
        setIsOpen(false);
    };

    return (
        <div ref={selectRef} className={`c-select ${className}`} id={id}>
            <button
                type="button"
                className={`c-select-trigger ${isOpen ? "c-select-trigger--open" : ""}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="c-select-value">
                    {selectedOption ? (
                        <>
                            {selectedOption.prefixComponent}
                            <span>{selectedOption.label}</span>
                        </>
                    ) : (
                        <span className="c-select-placeholder">
                            {placeholder}
                        </span>
                    )}
                </div>
                <ChevronDown
                    size={20}
                    className={`c-select-icon ${isOpen ? "c-select-icon--rotate" : ""}`}
                />
            </button>

            {isOpen && (
                <div className="c-select-dropdown">
                    {options.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            className={`c-select-option ${
                                option.value === value
                                    ? "c-select-option--selected"
                                    : ""
                            }`}
                            onClick={() => handleSelect(option.value)}
                        >
                            {option.prefixComponent}
                            <span>{option.label}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
