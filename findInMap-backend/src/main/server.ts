import LoggerService from "../core/services/LoggerService";
import { InMemoryRateLimitService } from "../core/services/RateLimitService";
import JwtService from "../core/services/JwtService";
import TokenBlacklistService from "../core/services/TokenBlacklistService";
import GetMapPoints from "../core/usecases/GetMapPoints";
import CreateMapPoint from "../core/usecases/CreateMapPoint";
import CreateUser from "../core/usecases/CreateUser";
import LoginUser from "../core/usecases/LoginUser";
import LogoutUser from "../core/usecases/LogoutUser";
import RefreshToken from "../core/usecases/RefreshToken";
import SearchAddresses from "../core/usecases/SearchAddresses";
import { client } from "../db";
import { DrizzleMapPointRepository } from "../dependency-implementations/DrizzleMapPointRepository";
import { DrizzleUserRepository } from "../dependency-implementations/DrizzleUserRepository";
import GoogleRepository from "../dependency-implementations/GoogleRepository";
import RestInterface from "../interfaces/rest";
import config from "./config";

// Repositories
const mapPointRepository = new DrizzleMapPointRepository();
const userRepository = new DrizzleUserRepository();
const googleRepository = new GoogleRepository(config.googleMapsApiKey);

// Services
// 15 seconds
const rateLimitService = new InMemoryRateLimitService(15);
const tokenBlacklistService = new TokenBlacklistService(config.jwtSecret);
const jwtService = new JwtService(config.jwtSecret, tokenBlacklistService);

// Usecases
const getMapPoints = new GetMapPoints(mapPointRepository);
const createMapPoint = new CreateMapPoint(mapPointRepository, rateLimitService);
const createUser = new CreateUser(userRepository);
const loginUser = new LoginUser(userRepository, jwtService);
const logoutUser = new LogoutUser(jwtService);
const refreshToken = new RefreshToken(jwtService);
const searchAddresses = new SearchAddresses(googleRepository);

const restInterface = new RestInterface(
    config.publicUrl,
    config.port,
    config.appVersion,
    config.appName,
    config.corsAllowedOrigins,
    config.validateApiResponses,
    {
        createMapPoint,
        createUser,
        getMapPoints,
        loginUser,
        logoutUser,
        refreshToken,
        searchAddresses,
    },
    jwtService,
);

process.on("SIGINT", async () => {
    LoggerService.info("Received SIGINT. Shutting down gracefully...");
    rateLimitService.destroy();
    jwtService.destroy();
    await client.end();
    process.exit(0);
});

process.on("SIGTERM", async () => {
    LoggerService.info("Received SIGTERM. Shutting down gracefully...");
    rateLimitService.destroy();
    jwtService.destroy();
    await client.end();
    process.exit(0);
});

// Start server
(async () => {
    try {
        LoggerService.info(`Starting ${config.appName} v${config.appVersion}`);
        LoggerService.info(`Environment: ${config.nodeEnv}`);

        LoggerService.info("Database connected successfully");

        await restInterface.start();
        LoggerService.info(`${config.appName} is ready!`);
    } catch (error) {
        LoggerService.error("Failed to start server:", error);
        await client.end();
        process.exit(1);
    }
})();
