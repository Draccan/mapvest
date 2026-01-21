import React from "react";

import { setMultipleClassNames } from "../../utils/setMultipleClassNames";
import "./style.css";

interface ToggleProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
    className?: string;
    ariaLabel?: string;
}

export const Toggle: React.FC<ToggleProps> = ({
    checked,
    onChange,
    disabled = false,
    className,
    ariaLabel,
}) => {
    const handleClick = () => {
        if (!disabled) {
            onChange(!checked);
        }
    };

    const classNames = setMultipleClassNames(
        "c-toggle",
        checked && "c-toggle-checked",
        disabled && "c-toggle-disabled",
        className,
    );

    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-label={ariaLabel}
            className={classNames}
            onClick={handleClick}
            disabled={disabled}
        >
            <span className="c-toggle-track">
                <span className="c-toggle-thumb" />
            </span>
        </button>
    );
};
