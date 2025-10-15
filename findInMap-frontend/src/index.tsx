import React from "react";
import ReactDOM from "react-dom/client";
import App from "./ui/views/index.tsx";

async function enableMocking() {
    if (import.meta.env.DEV) {
        return;
    }

    console.log("Starting MSW in development mode...");

    const { worker } = await import("../mock-server/browser.ts");

    return worker
        .start({
            onUnhandledRequest: "warn",
        })
        .then(() => {
            console.log("MSW started successfully");
        });
}

enableMocking().then(() => {
    ReactDOM.createRoot(document.getElementById("root")!).render(
        <React.StrictMode>
            <App />
        </React.StrictMode>,
    );
});
