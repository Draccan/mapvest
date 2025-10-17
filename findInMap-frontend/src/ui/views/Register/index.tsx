import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import type CreateUserDto from "../../../core/dtos/CreateUserDto";
import { useCreateUser } from "../../../core/usecases/useCreateUser";
import getFormattedMessageWithScope from "../../../utils/getFormattedMessageWithScope";
import LogoSvg from "../../assets/logo.svg";
import routes from "../../commons/routes";
import { Button } from "../../components/Button";
import { Link } from "../../components/Link";
import "./style.css";

const fm = getFormattedMessageWithScope("views.Register");

interface RegisterFormData extends CreateUserDto {
    confirmPassword: string;
}

export const Register: React.FC = () => {
    const navigate = useNavigate();
    const { createUser, loading, error } = useCreateUser();
    const [formData, setFormData] = useState<RegisterFormData>({
        name: "",
        surname: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [passwordError, setPasswordError] = useState<React.ReactNode | null>(
        null,
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError(null);

        if (formData.password !== formData.confirmPassword) {
            setPasswordError(fm("passwordsDoNotMatch"));
            return;
        }

        const { confirmPassword, ...userData } = formData;

        const success = await createUser(userData);
        if (success) {
            navigate(routes.login());
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        if (name === "password" || name === "confirmPassword") {
            setPasswordError(null);
        }
    };

    return (
        <div className="c-register-container">
            <div className="c-register-form">
                <img src={LogoSvg} alt="MapVest" />
                <form onSubmit={handleSubmit}>
                    <div className="c-register-form-group">
                        <label htmlFor="name">{fm("nameLabel")}</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        />
                    </div>
                    <div className="c-register-form-group">
                        <label htmlFor="surname">{fm("surnameLabel")}</label>
                        <input
                            type="text"
                            id="surname"
                            name="surname"
                            value={formData.surname}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        />
                    </div>
                    <div className="c-register-form-group">
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
                    <div className="c-register-form-group">
                        <label htmlFor="password">{fm("passwordLabel")}</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            disabled={loading}
                            minLength={8}
                        />
                    </div>
                    <div className="c-register-form-group">
                        <label htmlFor="confirmPassword">
                            {fm("confirmPasswordLabel")}
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            disabled={loading}
                            minLength={8}
                        />
                    </div>
                    {(error || passwordError) && (
                        <div className="c-register-error-message">
                            {passwordError || error}
                        </div>
                    )}
                    <Button type="submit" disabled={loading}>
                        {loading ? fm("registering") : fm("register")}
                    </Button>
                </form>
                <div className="c-register-login-link">
                    <p>
                        {fm("alreadyHaveAccount")}{" "}
                        <Link to={routes.login()}>{fm("loginHere")}</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};
