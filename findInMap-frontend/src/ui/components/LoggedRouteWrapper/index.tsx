import React from "react";

import {
    GroupsMapsProvider,
    useGroupsMaps,
} from "../../../core/contexts/GroupsMapsContext";
import getFormattedMessageWithScope from "../../../utils/getFormattedMessageWithScope";
import "./style.css";

const fm = getFormattedMessageWithScope("components.LoggedRouteWrapper");

interface LoggedRouteWrapperContentProps {
    children: React.ReactNode;
}

const LoggedRouteWrapperContent: React.FC<LoggedRouteWrapperContentProps> = ({
    children,
}) => {
    const { isInitialized } = useGroupsMaps();

    if (!isInitialized) {
        return (
            <div className="c-logged-route-wrapper-loading">
                <div className="c-logged-route-wrapper-loading-spinner" />
                <div className="c-logged-route-wrapper-loading-text">
                    {fm("loadingData")}
                </div>
            </div>
        );
    }

    return <>{children}</>;
};

interface LoggedRouteWrapperProps {
    children: React.ReactNode;
}

export const LoggedRouteWrapper: React.FC<LoggedRouteWrapperProps> = ({
    children,
}) => {
    return (
        <GroupsMapsProvider>
            <LoggedRouteWrapperContent>{children}</LoggedRouteWrapperContent>
        </GroupsMapsProvider>
    );
};
