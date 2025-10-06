import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import type LoginUserDto from "../../../core/dtos/LoginUserDto";
import { useLoginUser } from "../../../core/usecases/useLoginUser";
import getFormattedMessageWithScope from "../../../utils/getFormattedMessageWithScope";
import LogoSvg from "../../assets/logo.svg";
import routes from "../../commons/routes";
import { Button } from "../../components/Button";
import { Link } from "../../components/Link";
import "./style.css";

const fm = getFormattedMessageWithScope("views.Login");

export const Login: React.FC = () => {
    const navigate = useNavigate();
    const { login, loading, error } = useLoginUser();
    const [formData, setFormData] = useState<LoginUserDto>({
        email: "",
        password: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const success = await login(formData);
        if (success) {
            navigate(routes.home());
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    return (
        <div className="c-login-container">
            <div className="c-login-form">
                <img src={LogoSvg} alt="MapVest" />
                <form onSubmit={handleSubmit}>
                    <div className="c-login-form-group">
                        <label htmlFor="email">{fm("emailLabel")}</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        />
                    </div>
                    <div className="c-login-form-group">
                        <label htmlFor="password">{fm("passwordLabel")}</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        />
                    </div>
                    {error && (
                        <div className="c-login-error-message">{error}</div>
                    )}
                    <Button
                        key={loading ? "loading" : "idle"}
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? fm("loading") : fm("login")}
                    </Button>
                </form>
                <div className="c-login-register-link">
                    <p>
                        {fm("noAccount")}{" "}
                        <Link to={routes.register()}>{fm("registerHere")}</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};
