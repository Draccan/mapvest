import React, { forwardRef } from "react";

import { setMultipleClassNames } from "../../utils/setMultipleClassNames";
import { LoadingSpinner } from "../LoadingSpinner";
import "./style.css";

export type ButtonKind = "primary" | "danger" | "secondary";

export interface ButtonProps {
    kind?: ButtonKind;
    size?: "small" | "large" | "icon";
    type?: "button" | "submit" | "reset";
    disabled?: boolean;
    loading?: boolean;
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    children: React.ReactNode;
    className?: string;
    fullWidth?: boolean;
    title?: string;
    "aria-label"?: string;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            kind = "primary",
            size = "large",
            type = "button",
            disabled = false,
            loading = false,
            onClick,
            children,
            className = "",
            fullWidth = true,
            title,
            "aria-label": ariaLabel,
        },
        ref,
    ) => {
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
                ref={ref}
                type={type}
                disabled={disabled || loading}
                onClick={handleClick}
                className={classNames}
                title={title}
                aria-label={ariaLabel}
            >
                {loading ? (
                    size === "icon" ? (
                        <LoadingSpinner />
                    ) : (
                        <span className="c-button-loading-content">
                            <LoadingSpinner />
                            {children}
                        </span>
                    )
                ) : (
                    children
                )}
            </button>
        );
    },
);

Button.displayName = "Button";
