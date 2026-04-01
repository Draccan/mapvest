import { Menu, X } from "lucide-react";
import React, { useState, useEffect } from "react";

import LogoSvg from "../../assets/logo.svg";
import { Breadcrumb } from "../Breadcrumb";
import { NavigationBar } from "../NavigationBar";
import "./style.css";

export const Header: React.FC = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isMobileMenuOpen]);

    return (
        <>
            <header className="c-header">
                <div className="c-header-left">
                    <div className="c-header-logo">
                        <img src={LogoSvg} alt="MapVest" />
                    </div>
                    <Breadcrumb />
                </div>
                <div className="c-header-desktop-nav">
                    <NavigationBar />
                </div>
                <button
                    className="c-header-mobile-toggle"
                    onClick={() => setIsMobileMenuOpen(true)}
                    aria-label="Open menu"
                >
                    <Menu size={24} />
                </button>
            </header>
            {isMobileMenuOpen && (
                <div className="c-header-mobile-fullscreen">
                    <button
                        className="c-header-mobile-close"
                        onClick={() => setIsMobileMenuOpen(false)}
                        aria-label="Close menu"
                    >
                        <X size={28} />
                    </button>
                    <div className="c-header-mobile-logo">
                        <img src={LogoSvg} alt="MapVest" />
                    </div>
                    <NavigationBar onNavigate={() => setIsMobileMenuOpen(false)} />
                </div>
            )}
        </>
    );
};
