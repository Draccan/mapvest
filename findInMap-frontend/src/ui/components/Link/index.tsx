import React from "react";
import {
    Link as RouterLink,
    type LinkProps as RouterLinkProps,
} from "react-router-dom";

import { setMultipleClassNames } from "../../utils/setMultipleClassNames";
import "./style.css";

export type LinkKind = "nav";

export interface LinkProps extends RouterLinkProps {
    kind?: LinkKind;
    to: string;
    children: React.ReactNode;
    className?: string;
}

export const Link: React.FC<LinkProps> = ({
    kind = "nav",
    to,
    children,
    className,
    ...props
}) => {
    const classNames = setMultipleClassNames(
        "c-link",
        `c-link-${kind}`,
        className,
    );

    return (
        <RouterLink to={to} className={classNames} {...props}>
            <span>{children}</span>
        </RouterLink>
    );
};
