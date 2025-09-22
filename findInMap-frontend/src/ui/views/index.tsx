import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import routes from "../commons/routes";
import About from "./About";
import { Home } from "./Home";
import NotFound from "./NotFound";

const App: React.FC = () => {
    return (
        <Router>
            <Routes>
                <Route path={routes.home()} element={<Home />} />
                <Route path={routes.about()} element={<About />} />
                <Route path={routes.notFound()} element={<NotFound />} />
            </Routes>
        </Router>
    );
};

export default App;
