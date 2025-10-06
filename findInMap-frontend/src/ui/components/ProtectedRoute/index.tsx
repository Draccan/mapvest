import React from "react";
import { Navigate } from "react-router-dom";

import { useAuth } from "../../commons/hooks/useAuth";
import routes from "../../commons/routes";
import "./style.css";

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return <div className="c-ProtectedRoute-loading">Loading...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to={routes.login()} replace />;
    }

    return <>{children}</>;
};
