import * as pkg from "../../package.json";
import { config } from "dotenv";

// Load environment variables
config();

function env(
    name: string,
    options: {
        required?: boolean;
        default?: string;
        nonProductionDefault?: string;
        parse?: (value: string) => any;
    } = {},
): any {
    const value = process.env[name];
    const isProduction = process.env.NODE_ENV === "production";

    if (!value) {
        if (options.required && isProduction) {
            throw new Error(
                `Environment variable ${name} is required in production`,
            );
        }

        const defaultValue = isProduction
            ? options.default
            : options.nonProductionDefault || options.default;

        if (defaultValue !== undefined) {
            return options.parse ? options.parse(defaultValue) : defaultValue;
        }

        if (options.required) {
            throw new Error(`Environment variable ${name} is required`);
        }

        return undefined;
    }

    return options.parse ? options.parse(value) : value;
}

export default {
    // General
    appName: pkg.name,
    appVersion: pkg.version,
    publicUrl: env("PUBLIC_URL", {
        required: true,
        nonProductionDefault: "http://localhost:3001",
    }),
    port: env("PORT", {
        default: "3001",
        parse: (value) => parseInt(value, 10),
    }),
    nodeEnv: env("NODE_ENV", {
        default: "development",
    }),

    // Logging
    logLevel: env("LOG_LEVEL", {
        default: "INFO",
        parse: (value) => value.toUpperCase(),
    }),

    // API
    validateApiResponses: env("VALIDATE_API_RESPONSES", {
        default: "false",
        parse: (value) => value === "true",
    }),

    // Security
    corsAllowedOrigins: env("CORS_ALLOWED_ORIGINS", {
        required: true,
        nonProductionDefault: "*",
        parse: (originsCommaSeparatedList) =>
            originsCommaSeparatedList
                .split(",")
                .map((origin) => origin.trim())
                .filter((origin) => origin.length > 0),
    }),
    jwtSecret: env("JWT_SECRET", {
        required: true,
        nonProductionDefault: "your-super-secret-jwt-key-for-development-only",
    }),

    // Database
    databaseUrl: env("DATABASE_URL", {
        required: true,
        nonProductionDefault:
            "postgresql://findinmap:findinmap@localhost:5432/findinmap?schema=public",
    }),

    // Google APIs
    googleMapsApiKey: env("GOOGLE_MAPS_API_KEY", {
        required: true,
        nonProductionDefault: "",
    }),

    // SMTP Email Configuration
    smtpHost: env("SMTP_HOST", {
        required: true,
        nonProductionDefault: "smtp.aruba.it",
    }),
    smtpPort: env("SMTP_PORT", {
        default: "587",
        parse: (value) => parseInt(value, 10),
    }),
    smtpUser: env("SMTP_USER", {
        required: true,
        nonProductionDefault: "help@map-vest.com",
    }),
    smtpPassword: env("SMTP_PASSWORD", {
        required: true,
        nonProductionDefault: "your-smtp-password",
    }),
    smtpFromEmail: env("SMTP_FROM_EMAIL", {
        required: true,
        nonProductionDefault: "help@map-vest.com",
    }),
    smtpFromName: env("SMTP_FROM_NAME", {
        default: "MapVest",
    }),
    frontendUrl: env("FRONTEND_URL", {
        required: true,
        nonProductionDefault: "http://localhost:5173",
    }),
};
