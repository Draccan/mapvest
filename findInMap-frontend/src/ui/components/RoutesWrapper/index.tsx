import { useEffect, useState } from "react";

import { useUser } from "../../../core/contexts/UserContext";
import { useGetCurrentUser } from "../../../core/usecases/useGetCurrentUser";
import getFormattedMessageWithScope from "../../../utils/getFormattedMessageWithScope";
import TokenStorageService from "../../../utils/TokenStorageService";
import { useGlobalErrorHandler } from "../../commons/hooks/useGlobalErrorHandler";
import "./style.css";

const fm = getFormattedMessageWithScope("components.RoutesWrapper");

interface Props {
    children: React.ReactNode;
}

export const RoutesWrapper: React.FC<Props> = ({ children }) => {
    useGlobalErrorHandler();
    const { user } = useUser();
    const { getCurrentUser } = useGetCurrentUser();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadUserData = async () => {
            const hasRefreshToken = TokenStorageService.hasRefreshToken();

            if (hasRefreshToken && !user) {
                try {
                    await getCurrentUser();
                } catch (error) {
                    console.error("Failed to load user data:", error);
                }
            }
            setIsLoading(false);
        };

        loadUserData();
    }, []);

    if (isLoading) {
        return (
            <div className="c-routes-wrapper-loading">
                <div className="c-routes-wrapper-loading-spinner" />
                <div className="c-routes-wrapper-loading-text">
                    {fm("restoringSession")}
                </div>
            </div>
        );
    }

    return <div>{children}</div>;
};
