import React from "react";
import { Link } from "react-router-dom";

import routes from "../../commons/routes";
import "./style.css";

const About: React.FC = () => {
    return (
        <div className="v-about-container">
            <div className="v-about-content">
                <h1 className="v-about-title">Paolo Dell'Aguzzo</h1>
                <p className="v-about-description">
                    Senior Software Engineer Freelance
                </p>
                <div className="v-about-links">
                    <a
                        href="https://www.linkedin.com/in/paolodellaguzzo/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="v-link"
                    >
                        View my LinkedIn Profile
                    </a>
                </div>
                <nav className="v-about-navigation">
                    <Link to={routes.home()} className="v-nav-link">
                        ← Back to Home
                    </Link>
                </nav>
            </div>
        </div>
    );
};

export default About;
