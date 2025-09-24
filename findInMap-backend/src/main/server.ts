import { PrismaClient } from "@prisma/client";

import LoggerService from "../core/services/LoggerService";
import { InMemoryRateLimitService } from "../core/services/RateLimitService";
import GetMapPoints from "../core/usecases/GetMapPoints";
import CreateMapPoint from "../core/usecases/CreateMapPoint";
import PrismaMapPointRepository from "../dependency-implementations/PrismaMapPointRepository";
import RestInterface from "../interfaces/rest";
import config from "./config";

const prisma = new PrismaClient({
    log:
        config.nodeEnv === "development"
            ? ["query", "info", "warn", "error"]
            : ["error"],
});

// Repsitories
const mapPointRepository = new PrismaMapPointRepository(prisma);

// Services
// 15 seconds
const rateLimitService = new InMemoryRateLimitService(15);

// Usecases
const getMapPoints = new GetMapPoints(mapPointRepository);
const createMapPoint = new CreateMapPoint(mapPointRepository, rateLimitService);

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
    },
);

process.on("SIGINT", async () => {
    LoggerService.info("Received SIGINT. Shutting down gracefully...");
    rateLimitService.destroy();
    await prisma.$disconnect();
    process.exit(0);
});

process.on("SIGTERM", async () => {
    LoggerService.info("Received SIGTERM. Shutting down gracefully...");
    rateLimitService.destroy();
    await prisma.$disconnect();
    process.exit(0);
});

// Start server
(async () => {
    try {
        LoggerService.info(`Starting ${config.appName} v${config.appVersion}`);
        LoggerService.info(`Environment: ${config.nodeEnv}`);

        await prisma.$connect();
        LoggerService.info("Database connected successfully");

        await restInterface.start();
        LoggerService.info(`${config.appName} is ready!`);
    } catch (error) {
        LoggerService.error("Failed to start server:", error);
        await prisma.$disconnect();
        process.exit(1);
    }
})();
