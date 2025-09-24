import React from "react";
import { IntlProvider } from "react-intl";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import i18nMessages from "../../i18n";
import routes from "../commons/routes";
import About from "./About";
import { Home } from "./Home";
import NotFound from "./NotFound";

const App: React.FC = () => {
    const browserLanguage = navigator.language || "en-US";

    return (
        <IntlProvider
            locale={browserLanguage}
            key={browserLanguage}
            messages={
                browserLanguage === "it-IT" ? i18nMessages.it : i18nMessages.en
            }
        >
            <Router>
                <Routes>
                    <Route path={routes.home()} element={<Home />} />
                    <Route path={routes.about()} element={<About />} />
                    <Route path={routes.notFound()} element={<NotFound />} />
                </Routes>
            </Router>
        </IntlProvider>
    );
};

export default App;
