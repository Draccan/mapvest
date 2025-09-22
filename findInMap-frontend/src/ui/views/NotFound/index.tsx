import React from "react";
import { Link } from "react-router-dom";

import routes from "../../commons/routes";
import "./style.css";

const NotFound: React.FC = () => {
    return (
        <div className="v-notfound-container">
            <div className="v-notfound-content">
                <div className="v-notfound-animation">
                    <div className="v-floating-404">404</div>
                </div>
                <h1 className="v-notfound-title">Oops! You're lost!</h1>
                <p className="v-notfound-description">
                    It looks like you took a wrong turn.
                    <br />
                    This location hasn't been mapped yet!
                </p>
                <div className="v-notfound-actions">
                    <Link to={routes.home()} className="v-home-button">
                        🧭 Back to Map
                    </Link>
                </div>
                <div className="v-notfound-footer">
                    <p>
                        Don't worry, even the best explorers get lost sometimes!
                        🔎
                    </p>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
