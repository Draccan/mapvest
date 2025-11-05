module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    roots: ["<rootDir>/src", "<rootDir>/tests"],
    testMatch: ["**/__tests__/**/*.ts", "**/?(*.)+(spec|test).ts"],
    transform: {
        "^.+\\.ts$": "ts-jest",
    },
    coverageDirectory: "coverage",
    collectCoverageFrom: [
        "src/**/*.ts",
        "!src/**/*.d.ts",
        "!src/main/server.ts",
        "!src/db/index.ts",
    ],
    setupFilesAfterEnv: [
        "<rootDir>/tests/setup.ts",
        "<rootDir>/tests/e2e/setup.ts",
    ],
    testTimeout: 10000,
    forceExit: true,
    clearMocks: true,
    resetMocks: true,
    restoreMocks: true,
    // Warning: Limit to 1 worker to avoid database problems executing tests in
    // parallel
    maxWorkers: 1,
};
