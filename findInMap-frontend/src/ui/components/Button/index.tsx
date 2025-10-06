import React from "react";

import { setMultipleClassNames } from "../../utils/setMultipleClassNames";
import "./style.css";

export type ButtonKind = "primary" | "danger";

export interface ButtonProps {
    kind?: ButtonKind;
    size?: "small" | "large";
    type?: "button" | "submit" | "reset";
    disabled?: boolean;
    loading?: boolean;
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    children: React.ReactNode;
    className?: string;
    fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    kind = "primary",
    size = "large",
    type = "button",
    disabled = false,
    loading = false,
    onClick,
    children,
    className = "",
    fullWidth = true,
}) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (!disabled && !loading && onClick) {
            onClick(e);
        }
    };

    const classNames = setMultipleClassNames(
        "c-button",
        `c-button-${kind}`,
        `c-button-${size}`,
        fullWidth && "c-button-full-width",
        loading && "c-button-loading",
        className,
    );

    return (
        <button
            type={type}
            disabled={disabled || loading}
            onClick={handleClick}
            className={classNames}
        >
            {loading ? (
                <span className="c-button-loading-content">
                    <span className="c-button-spinner" />
                    {children}
                </span>
            ) : (
                children
            )}
        </button>
    );
};
