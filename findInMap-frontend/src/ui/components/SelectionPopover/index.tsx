import { Check } from "lucide-react";
import React from "react";

import { Popover } from "../Popover";
import "./style.css";

interface SelectionOption {
    id: string;
    label: string;
    disabled: boolean;
    onSelect: () => void;
}

interface SelectionPopoverProps {
    isOpen: boolean;
    onClose: () => void;
    options: SelectionOption[];
    anchorElement: HTMLElement | null;
}

export const SelectionPopover: React.FC<SelectionPopoverProps> = ({
    isOpen,
    onClose,
    options,
    anchorElement,
}) => {
    return (
        <Popover
            isOpen={isOpen}
            onClose={onClose}
            anchorElement={anchorElement}
        >
            <div className="c-selection-popover-content">
                {options.map((option) => (
                    <button
                        key={option.id}
                        className={`c-selection-popover-item ${option.disabled ? "c-selection-popover-item-disabled" : ""}`}
                        onClick={() => {
                            if (!option.disabled) {
                                option.onSelect();
                                onClose();
                            }
                        }}
                        disabled={option.disabled}
                        type="button"
                    >
                        <span>{option.label}</span>
                        {option.disabled && <Check size={16} />}
                    </button>
                ))}
            </div>
        </Popover>
    );
};
