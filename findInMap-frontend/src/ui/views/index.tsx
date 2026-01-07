import React from "react";
import { Toaster } from "react-hot-toast";
import { IntlProvider } from "react-intl";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { ApiClientProvider } from "../../core/contexts/ApiClientContext";
import { ThemeProvider } from "../../core/contexts/ThemeContext";
import { UserProvider } from "../../core/contexts/UserContext";
import i18nMessages from "../../i18n";
import routes from "../commons/routes";
import { LoggedRouteWrapper } from "../components/LoggedRouteWrapper";
import { RoutesWrapper } from "../components/RoutesWrapper";
import { Dashboard } from "./Dashboard";
import { Home } from "./Home";
import { Login } from "./Login";
import NotFound from "./NotFound";
import { Register } from "./Register";
import { ResetPassword } from "./ResetPassword";
import { User } from "./User";
import { Settings } from "./Settings";
import "./style.css";

const App: React.FC = () => {
    const browserLanguage = navigator.language || "en-US";

    return (
        <div className="v-App">
            <ThemeProvider>
                <IntlProvider
                    locale={browserLanguage}
                    key={browserLanguage}
                    messages={
                        browserLanguage === "it-IT"
                            ? i18nMessages.it
                            : i18nMessages.en
                    }
                >
                    <Toaster position="top-right" />
                    <ApiClientProvider>
                        <UserProvider>
                            <Router>
                                <RoutesWrapper>
                                    <Routes>
                                        <Route
                                            path={routes.login()}
                                            element={<Login />}
                                        />
                                        <Route
                                            path={routes.register()}
                                            element={<Register />}
                                        />
                                        <Route
                                            path={routes.resetPassword()}
                                            element={<ResetPassword />}
                                        />
                                        <Route
                                            path={routes.home()}
                                            element={
                                                <LoggedRouteWrapper>
                                                    <Home />
                                                </LoggedRouteWrapper>
                                            }
                                        />
                                        <Route
                                            path={routes.dashboard()}
                                            element={
                                                <LoggedRouteWrapper>
                                                    <Dashboard />
                                                </LoggedRouteWrapper>
                                            }
                                        />
                                        <Route
                                            path={routes.settings()}
                                            element={
                                                <LoggedRouteWrapper>
                                                    <Settings />
                                                </LoggedRouteWrapper>
                                            }
                                        />
                                        <Route
                                            path={routes.user()}
                                            element={
                                                <LoggedRouteWrapper>
                                                    <User />
                                                </LoggedRouteWrapper>
                                            }
                                        />
                                        <Route
                                            path={routes.notFound()}
                                            element={<NotFound />}
                                        />
                                    </Routes>
                                </RoutesWrapper>
                            </Router>
                        </UserProvider>
                    </ApiClientProvider>
                </IntlProvider>
            </ThemeProvider>
        </div>
    );
};

export default App;
