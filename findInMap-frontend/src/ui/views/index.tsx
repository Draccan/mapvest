import React from "react";
import { IntlProvider } from "react-intl";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { ApiClientProvider } from "../../core/contexts/ApiClientContext";
import i18nMessages from "../../i18n";
import routes from "../commons/routes";
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
                        <Routes>
                            <Route path={routes.login()} element={<Login />} />
                            <Route
                                path={routes.register()}
                                element={<Register />}
                            />
                            <Route path={routes.home()} element={<Home />} />
                            <Route path={routes.about()} element={<About />} />
                            <Route
                                path={routes.notFound()}
                                element={<NotFound />}
                            />
                        </Routes>
                    </Router>
                </ApiClientProvider>
            </IntlProvider>
        </div>
    );
};

export default App;
