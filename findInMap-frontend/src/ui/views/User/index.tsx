import React, { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { useNavigate } from "react-router-dom";

import { useUser } from "../../../core/contexts/UserContext";
import { useUpdateUser } from "../../../core/usecases/useUpdateUser";
import getFormattedMessageWithScope from "../../../utils/getFormattedMessageWithScope";
import LogoSvg from "../../assets/logo.svg";
import usePrevious from "../../commons/hooks/usePrevious";
import routes from "../../commons/routes";
import { Button } from "../../components/Button";
import { Link } from "../../components/Link";
import "./style.css";

const fm = getFormattedMessageWithScope("views.User");

export const User: React.FC = () => {
    const intl = useIntl();
    const navigate = useNavigate();
    const { user } = useUser();
    const { updatePassword, loading, error } = useUpdateUser();
    const previousLoading = usePrevious(loading);
    const [formData, setFormData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
    });
    const [hasSuccess, setHasSuccess] = useState<boolean>(false);
    const [hasValidationError, setHasValidationError] =
        useState<boolean>(false);

    if (!user) {
        navigate(routes.login());
        return null;
    }

    useEffect(() => {
        if (previousLoading && !loading && !error) {
            setHasSuccess(true);
        }
    }, [previousLoading, loading, error, intl]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setHasSuccess(false);
        setHasValidationError(false);

        if (formData.newPassword !== formData.confirmNewPassword) {
            setHasValidationError(true);
            return;
        }

        try {
            await updatePassword(user.id, {
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword,
            });
            setFormData({
                currentPassword: "",
                newPassword: "",
                confirmNewPassword: "",
            });
        } catch (err) {}
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    return (
        <div className="v-user-container">
            <div className="v-user-content">
                <div className="v-user-logo">
                    <img src={LogoSvg} alt="MapVest" />
                </div>

                <h1>{fm("title")}</h1>

                <section className="v-user-info-section">
                    <h2>{fm("userInfo")}</h2>
                    <div className="v-user-info-grid">
                        <div className="v-user-info-item">
                            <span className="v-user-info-label">
                                {fm("name")}:
                            </span>
                            <span className="v-user-info-value">
                                {user.name}
                            </span>
                        </div>
                        <div className="v-user-info-item">
                            <span className="v-user-info-label">
                                {fm("surname")}:
                            </span>
                            <span className="v-user-info-value">
                                {user.surname}
                            </span>
                        </div>
                        <div className="v-user-info-item">
                            <span className="v-user-info-label">
                                {fm("email")}:
                            </span>
                            <span className="v-user-info-value">
                                {user.email}
                            </span>
                        </div>
                    </div>
                </section>

                <section className="v-user-password-section">
                    <h2>{fm("changePassword")}</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="v-user-form-group">
                            <label htmlFor="currentPassword">
                                {fm("currentPassword")}
                            </label>
                            <input
                                type="password"
                                id="currentPassword"
                                name="currentPassword"
                                value={formData.currentPassword}
                                onChange={handleChange}
                                required
                                disabled={loading}
                            />
                        </div>
                        <div className="v-user-form-group">
                            <label htmlFor="newPassword">
                                {fm("newPassword")}
                            </label>
                            <input
                                type="password"
                                id="newPassword"
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                required
                                disabled={loading}
                                minLength={8}
                                maxLength={20}
                            />
                        </div>
                        <div className="v-user-form-group">
                            <label htmlFor="confirmNewPassword">
                                {fm("confirmNewPassword")}
                            </label>
                            <input
                                type="password"
                                id="confirmNewPassword"
                                name="confirmNewPassword"
                                value={formData.confirmNewPassword}
                                onChange={handleChange}
                                required
                                disabled={loading}
                                minLength={8}
                                maxLength={20}
                            />
                        </div>
                        {hasValidationError && (
                            <div className="v-user-error-message">
                                {fm("passwordsDoNotMatch")}
                            </div>
                        )}
                        {error && (
                            <div className="v-user-error-message">
                                {error.includes("incorrect")
                                    ? fm("incorrectCurrentPassword")
                                    : fm("passwordUpdateError")}
                            </div>
                        )}
                        {hasSuccess && (
                            <div className="v-user-success-message">
                                {fm("passwordUpdatedSuccess")}
                            </div>
                        )}
                        <Button
                            key={loading ? "loading" : "idle"}
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? fm("updating") : fm("updatePassword")}
                        </Button>
                    </form>
                </section>

                <div className="v-user-back-link">
                    <Link to={routes.home()}>{fm("backToMap")}</Link>
                </div>
            </div>
        </div>
    );
};
