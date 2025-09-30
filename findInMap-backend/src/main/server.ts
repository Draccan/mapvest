import LoggerService from "../core/services/LoggerService";
import { InMemoryRateLimitService } from "../core/services/RateLimitService";
import GetMapPoints from "../core/usecases/GetMapPoints";
import CreateMapPoint from "../core/usecases/CreateMapPoint";
import CreateUser from "../core/usecases/CreateUser";
import { client } from "../db";
import { DrizzleMapPointRepository } from "../dependency-implementations/DrizzleMapPointRepository";
import { DrizzleUserRepository } from "../dependency-implementations/DrizzleUserRepository";
import RestInterface from "../interfaces/rest";
import config from "./config";

// Repositories
const mapPointRepository = new DrizzleMapPointRepository();
const userRepository = new DrizzleUserRepository();

// Services
// 15 seconds
const rateLimitService = new InMemoryRateLimitService(15);

// Usecases
const getMapPoints = new GetMapPoints(mapPointRepository);
const createMapPoint = new CreateMapPoint(mapPointRepository, rateLimitService);
const createUser = new CreateUser(userRepository);

const restInterface = new RestInterface(
    config.publicUrl,
    config.port,
    config.appVersion,
    config.appName,
    config.corsAllowedOrigins,
    config.validateApiResponses,
    {
        getMapPoints,
        createMapPoint,
        createUser,
    },
);

process.on("SIGINT", async () => {
    LoggerService.info("Received SIGINT. Shutting down gracefully...");
    rateLimitService.destroy();
    await client.end();
    process.exit(0);
});

process.on("SIGTERM", async () => {
    LoggerService.info("Received SIGTERM. Shutting down gracefully...");
    rateLimitService.destroy();
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
