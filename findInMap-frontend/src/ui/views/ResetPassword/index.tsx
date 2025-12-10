import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { useUpdateUserPassword } from "../../../core/usecases/useUpdateUserPassword";
import getFormattedMessageWithScope from "../../../utils/getFormattedMessageWithScope";
import LogoSvg from "../../assets/logo.svg";
import routes from "../../commons/routes";
import usePrevious from "../../commons/hooks/usePrevious";
import { Button } from "../../components/Button";
import "./style.css";

const fm = getFormattedMessageWithScope("views.ResetPassword");

export const ResetPassword: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const { updatePassword, loading, error } = useUpdateUserPassword();
    const previousLoading = usePrevious(loading);
    const [formData, setFormData] = useState({
        password: "",
        confirmPassword: "",
    });
    const [passwordError, setPasswordError] = useState<React.ReactNode | null>(
        null,
    );

    useEffect(() => {
        if (!token) {
            navigate(routes.login());
        }
    }, [token, navigate]);

    useEffect(() => {
        if (previousLoading && !loading && !error) {
            navigate(routes.login(), {
                state: { passwordResetSuccess: true },
            });
        }
    }, [loading, previousLoading, error]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError(null);

        if (formData.password !== formData.confirmPassword) {
            setPasswordError(fm("passwordsDoNotMatch"));
            return;
        }

        await updatePassword(token!, formData.password);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }));

        if (name === "password" || name === "confirmPassword") {
            setPasswordError(null);
        }
    };

    return (
        <div className="v-reset-password-container">
            <div className="v-reset-password-form">
                <img src={LogoSvg} alt="MapVest" />
                <h2>{fm("title")}</h2>
                <p className="v-reset-password-description">
                    {fm("description")}
                </p>
                <form onSubmit={handleSubmit}>
                    <div className="v-reset-password-form-group">
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
                    <div className="v-reset-password-form-group">
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
                        <div className="v-reset-password-error-message">
                            {passwordError || error}
                        </div>
                    )}
                    <Button type="submit" disabled={loading}>
                        {loading ? fm("resetting") : fm("resetPassword")}
                    </Button>
                </form>
            </div>
        </div>
    );
};
