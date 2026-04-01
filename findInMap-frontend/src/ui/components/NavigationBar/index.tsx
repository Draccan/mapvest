import React from "react";

import { useLogoutUser } from "../../../core/usecases/useLogoutUser";
import getFormattedMessageWithScope from "../../../utils/getFormattedMessageWithScope";
import routes from "../../commons/routes";
import { Button } from "../Button";
import { Link } from "../Link";
import "./style.css";

const fm = getFormattedMessageWithScope("components.NavigationBar");

interface NavigationBarProps {
    onNavigate?: () => void;
}

export const NavigationBar: React.FC<NavigationBarProps> = ({ onNavigate }) => {
    const { loading, logout } = useLogoutUser();

    const handleLinkClick = () => {
        onNavigate?.();
    };

    const handleLogout = async () => {
        await logout();
        onNavigate?.();
    };

    return (
        <nav className="c-navigation-bar">
            <Link to={routes.home()} kind="nav" onClick={handleLinkClick}>
                {fm("home")}
            </Link>
            <Link to={routes.dashboard()} kind="nav" onClick={handleLinkClick}>
                {fm("dashboard")}
            </Link>
            <Link to={routes.settings()} kind="nav" onClick={handleLinkClick}>
                {fm("settings")}
            </Link>
            <Link to={routes.user()} kind="nav" onClick={handleLinkClick}>
                {fm("user")}
            </Link>
            <Button
                onClick={handleLogout}
                type="button"
                kind="danger"
                size="small"
                loading={loading}
            >
                {fm("logout")}
            </Button>
        </nav>
    );
};
