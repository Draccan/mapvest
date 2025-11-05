import { Sun, Moon } from "lucide-react";
import React from "react";
import { useIntl } from "react-intl";

import { useTheme } from "../../../core/contexts/ThemeContext";
import { setMultipleClassNames } from "../../utils/setMultipleClassNames";
import "./style.css";

interface ThemeToggleProps {
    className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className }) => {
    const { theme, toggleTheme } = useTheme();
    const intl = useIntl();

    const ariaLabel = intl.formatMessage({
        id:
            theme === "light"
                ? "components.ThemeToggle.switchToDark"
                : "components.ThemeToggle.switchToLight",
    });

    const classNames = setMultipleClassNames("c-themeToggle", className);

    return (
        <button
            className={classNames}
            onClick={toggleTheme}
            aria-label={ariaLabel}
            title={ariaLabel}
        >
            <div
                className={`c-themeToggle-slider ${theme === "dark" ? "c-themeToggle-dark" : ""}`}
            >
                <span className="c-themeToggle-icon c-themeToggle-sun">
                    <Sun size={18} />
                </span>
                <span className="c-themeToggle-icon c-themeToggle-moon">
                    <Moon size={18} />
                </span>
            </div>
        </button>
    );
};
