import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";

import type LoginUserDto from "../../../core/dtos/LoginUserDto";
import { useLoginUser } from "../../../core/usecases/useLoginUser";
import { useResetPassword } from "../../../core/usecases/useResetPassword";
import getFormattedMessageWithScope from "../../../utils/getFormattedMessageWithScope";
import LogoSvg from "../../assets/logo.svg";
import usePrevious from "../../commons/hooks/usePrevious";
import routes from "../../commons/routes";
import { Button } from "../../components/Button";
import { Link } from "../../components/Link";
import "./style.css";

const fm = getFormattedMessageWithScope("views.Login");

export const Login: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, loading, error } = useLoginUser();
    const {
        resetPassword,
        loading: resetLoading,
        error: resetError,
    } = useResetPassword();
    const previousResetLoading = usePrevious(resetLoading);
    const [formData, setFormData] = useState<LoginUserDto>({
        email: "",
        password: "",
    });
    const [showResetPassword, setShowResetPassword] = useState(false);
    const [resetEmail, setResetEmail] = useState("");
    const [resetSuccess, setResetSuccess] = useState(false);

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

    useEffect(() => {
        if (!resetError && !resetLoading && previousResetLoading) {
            setResetSuccess(true);
            setShowResetPassword(false);
            setResetEmail("");
        }
    }, [resetLoading, resetError, previousResetLoading]);

    useEffect(() => {
        if (location.state?.passwordResetSuccess) {
            toast.success(fm("passwordResetSuccessToast"), { duration: 5000 });
            location.state = {};
        }
    }, [location, navigate]);

    const handleResetPasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await resetPassword(resetEmail);
    };

    const handleForgotPasswordClick = () => {
        setShowResetPassword(true);
        setResetSuccess(false);
    };

    const handleCancelReset = () => {
        setShowResetPassword(false);
        setResetEmail("");
        setResetSuccess(false);
    };

    return (
        <div className="c-login-container">
            <div className="c-login-form">
                <img src={LogoSvg} alt="MapVest" />
                {!showResetPassword ? (
                    <>
                        <form onSubmit={handleSubmit}>
                            <div className="c-login-form-group">
                                <label htmlFor="email">
                                    {fm("emailLabel")}
                                </label>
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
                                <label htmlFor="password">
                                    {fm("passwordLabel")}
                                </label>
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
                            <div className="c-login-forgot-password">
                                <button
                                    type="button"
                                    onClick={handleForgotPasswordClick}
                                    className="c-login-forgot-password-link"
                                    disabled={loading}
                                >
                                    {fm("forgotPassword")}
                                </button>
                            </div>
                            {error && (
                                <div className="c-login-error-message">
                                    {error}
                                </div>
                            )}
                            {resetSuccess && (
                                <div className="c-login-success-message">
                                    {fm("resetPasswordSuccess")}
                                </div>
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
                                <Link to={routes.register()}>
                                    {fm("registerHere")}
                                </Link>
                            </p>
                        </div>
                    </>
                ) : (
                    <form onSubmit={handleResetPasswordSubmit}>
                        <h2 className="c-login-reset-title">
                            {fm("resetPasswordTitle")}
                        </h2>
                        <p className="c-login-reset-description">
                            {fm("resetPasswordDescription")}
                        </p>
                        <div className="c-login-form-group">
                            <label htmlFor="resetEmail">
                                {fm("emailLabel")}
                            </label>
                            <input
                                type="email"
                                id="resetEmail"
                                name="resetEmail"
                                value={resetEmail}
                                onChange={(e) => setResetEmail(e.target.value)}
                                required
                                disabled={resetLoading}
                            />
                        </div>
                        <div className="c-login-reset-buttons">
                            <Button
                                key={resetLoading ? "loading" : "idle"}
                                type="submit"
                                disabled={resetLoading}
                            >
                                {resetLoading
                                    ? fm("sending")
                                    : fm("sendResetLink")}
                            </Button>
                            <Button
                                type="button"
                                onClick={handleCancelReset}
                                disabled={resetLoading}
                                kind="secondary"
                            >
                                {fm("cancel")}
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};
