import React from "react";
import { Link } from "react-router-dom";

import getFormattedMessageWithScope from "../../../utils/getFormattedMessageWithScope";
import routes from "../../commons/routes";
import "./style.css";

const fm = getFormattedMessageWithScope("views.NotFound");

const NotFound: React.FC = () => {
    return (
        <div className="v-notfound-container">
            <div className="v-notfound-content">
                <div className="v-notfound-animation">
                    <div className="v-floating-404">404</div>
                </div>
                <h1 className="v-notfound-title">{fm("title")}</h1>
                <p className="v-notfound-description">
                    {fm("description")}
                    <br />
                    {fm("description2")}
                </p>
                <div className="v-notfound-actions">
                    <Link to={routes.home()} className="v-home-button">
                        🧭 {fm("backToMap")}
                    </Link>
                </div>
                <div className="v-notfound-footer">
                    <p>
                        {fm("footerMessage")}
                        🔎
                    </p>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
