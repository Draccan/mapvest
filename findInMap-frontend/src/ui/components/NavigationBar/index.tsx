import React from "react";

import { useLogoutUser } from "../../../core/usecases/useLogoutUser";
import getFormattedMessageWithScope from "../../../utils/getFormattedMessageWithScope";
import routes from "../../commons/routes";
import { Button } from "../Button";
import { Link } from "../Link";
import "./style.css";

const fm = getFormattedMessageWithScope("components.NavigationBar");

export const NavigationBar: React.FC = () => {
    const { loading, logout } = useLogoutUser();

    return (
        <nav className="c-navigation-bar">
            <Link to={routes.home()} kind="nav">
                {fm("home")}
            </Link>
            <Link to={routes.dashboard()} kind="nav">
                {fm("dashboard")}
            </Link>
            <Link to={routes.settings()} kind="nav">
                {fm("settings")}
            </Link>
            <Link to={routes.user()} kind="nav">
                {fm("user")}
            </Link>
            <Button
                onClick={logout}
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
