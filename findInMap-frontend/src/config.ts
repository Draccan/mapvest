// Debug delle variabili d'ambiente
console.log("Environment variables:", {
    NODE_ENV: import.meta.env.NODE_ENV,
    MODE: import.meta.env.MODE,
    VITE_APP_API_URL: import.meta.env.VITE_APP_API_URL,
    all: import.meta.env,
});

export const API_URL =
    import.meta.env.VITE_APP_API_URL || "http://localhost:3001";

console.log("Final API_URL:", API_URL);
console.log("AAA process.env", process.env);
