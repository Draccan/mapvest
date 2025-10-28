import React from "react";
import { IntlProvider } from "react-intl";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { ApiClientProvider } from "../../core/contexts/ApiClientContext";
import { ThemeProvider } from "../../core/contexts/ThemeContext";
import i18nMessages from "../../i18n";
import routes from "../commons/routes";
import { RoutesWrapper } from "../components/RoutesWrapper";
import About from "./About";
import { Home } from "./Home";
import { Login } from "./Login";
import { Register } from "./Register";
import NotFound from "./NotFound";
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
                    <ApiClientProvider>
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
                                        path={routes.home()}
                                        element={<Home />}
                                    />
                                    <Route
                                        path={routes.about()}
                                        element={<About />}
                                    />
                                    <Route
                                        path={routes.notFound()}
                                        element={<NotFound />}
                                    />
                                </Routes>
                            </RoutesWrapper>
                        </Router>
                    </ApiClientProvider>
                </IntlProvider>
            </ThemeProvider>
        </div>
    );
};

export default App;
