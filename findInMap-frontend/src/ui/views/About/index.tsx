import React from "react";
import { Link } from "react-router-dom";

import getFormattedMessageWithScope from "../../../utils/getFormattedMessageWithScope";
import routes from "../../commons/routes";
import "./style.css";

const fm = getFormattedMessageWithScope("views.About");

const About: React.FC = () => {
    return (
        <div className="v-about-container">
            <div className="v-about-content">
                <h1 className="v-about-title">Paolo Dell'Aguzzo</h1>
                <p className="v-about-description">{fm("description")}</p>
                <div className="v-about-links">
                    <a
                        href="https://www.linkedin.com/in/paolodellaguzzo/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="v-link"
                    >
                        {fm("viewLinkedIn")}
                    </a>
                </div>
                <nav className="v-about-navigation">
                    <Link to={routes.home()} className="v-nav-link">
                        ← {fm("backToMap")}
                    </Link>
                </nav>
            </div>
        </div>
    );
};

export default About;
