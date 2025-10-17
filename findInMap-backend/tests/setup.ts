import { config } from "dotenv";

const isProduction = process.env.NODE_ENV === "production";

if (isProduction) {
    throw new Error("CANNOT RUN TESTS IN PRODUCTION ENVIRONMENT!");
}

config({ path: ".env.test" });

process.env.NODE_ENV = "test";
process.env.DATABASE_URL =
    process.env.DATABASE_URL ||
    "postgresql://postgres:findinmap@localhost:5432/findinmap";
process.env.JWT_SECRET =
    process.env.JWT_SECRET || "test-jwt-secret-for-testing-only";

jest.setTimeout(10000);

jest.mock("winston", () => ({
    createLogger: jest.fn(() => ({
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
    })),
    format: {
        combine: jest.fn(),
        timestamp: jest.fn(),
        json: jest.fn(),
        colorize: jest.fn(),
        simple: jest.fn(),
        errors: jest.fn(),
        printf: jest.fn(),
    },
    transports: {
        Console: jest.fn(),
        File: jest.fn(),
    },
}));
