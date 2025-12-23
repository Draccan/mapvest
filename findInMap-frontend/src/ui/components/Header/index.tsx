import LogoSvg from "../../assets/logo.svg";
import { Breadcrumb } from "../Breadcrumb";
import { NavigationBar } from "../NavigationBar";
import "./style.css";

export const Header: React.FC = () => {
    return (
        <header className="c-header">
            <div className="c-header-left">
                <div className="c-header-logo">
                    <img src={LogoSvg} alt="MapVest" />
                </div>
                <Breadcrumb />
            </div>
            <NavigationBar />
        </header>
    );
};
