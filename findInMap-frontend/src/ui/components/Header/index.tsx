import LogoSvg from "../../assets/logo.svg";
import { NavigationBar } from "../NavigationBar";
import "./style.css";

export const Header: React.FC = () => {
    return (
        <header className="c-header">
            <div className="c-header-logo">
                <img src={LogoSvg} alt="MapVest" />
            </div>
            <NavigationBar />
        </header>
    );
};
