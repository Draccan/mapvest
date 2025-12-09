import EmailService from "../core/services/EmailService";
import LoggerService from "../core/services/LoggerService";
import JwtService from "../core/services/JwtService";
import TokenBlacklistService from "../core/services/TokenBlacklistService";
import CreateGroupMap from "../core/usecases/CreateGroupMap";
import CreateMapCategory from "../core/usecases/CreateMapCategory";
import CreateMapPoint from "../core/usecases/CreateMapPoint";
import CreateUser from "../core/usecases/CreateUser";
import DeleteMapPoints from "../core/usecases/DeleteMapPoints";
import GetMapCategories from "../core/usecases/GetMapCategories";
import GetMapPoints from "../core/usecases/GetMapPoints";
import GetUser from "../core/usecases/GetUser";
import GetUserGroups from "../core/usecases/GetUserGroups";
import LoginUser from "../core/usecases/LoginUser";
import LogoutUser from "../core/usecases/LogoutUser";
import RefreshToken from "../core/usecases/RefreshToken";
import ResetPassword from "../core/usecases/ResetPassword";
import SearchAddresses from "../core/usecases/SearchAddresses";
import UpdateMapPoint from "../core/usecases/UpdateMapPoint";
import UpdateUser from "../core/usecases/UpdateUser";
import UpdateUserPassword from "../core/usecases/UpdateUserPassword";
import { client } from "../db";
import { DrizzleGroupRepository } from "../dependency-implementations/DrizzleGroupRepository";
import { DrizzleMapRepository } from "../dependency-implementations/DrizzleMapRepository";
import { DrizzleUserRepository } from "../dependency-implementations/DrizzleUserRepository";
import GoogleRepository from "../dependency-implementations/GoogleRepository";
import RestInterface from "../interfaces/rest";
import config from "./config";

import GetGroupMaps from "../core/usecases/GetGroupMaps";

// Repositories
const groupRepository = new DrizzleGroupRepository();
const mapRepository = new DrizzleMapRepository();
const userRepository = new DrizzleUserRepository();
const googleRepository = new GoogleRepository(config.googleMapsApiKey);

// Services
// 15 seconds
const tokenBlacklistService = new TokenBlacklistService(config.jwtSecret);
const jwtService = new JwtService(config.jwtSecret, tokenBlacklistService);
const emailService = new EmailService(
    config.smtpHost,
    config.smtpPort,
    config.smtpUser,
    config.smtpPassword,
    config.smtpFromEmail,
    config.smtpFromName,
);

// Usecases
const getMapPoints = new GetMapPoints(groupRepository, mapRepository);
const createMapPoint = new CreateMapPoint(groupRepository, mapRepository);
const deleteMapPoints = new DeleteMapPoints(groupRepository, mapRepository);
const createUser = new CreateUser(
    userRepository,
    groupRepository,
    mapRepository,
);
const createGroupMap = new CreateGroupMap(mapRepository, groupRepository);
const getGroupMaps = new GetGroupMaps(mapRepository, groupRepository);
const getUserGroups = new GetUserGroups(groupRepository);
const loginUser = new LoginUser(userRepository, jwtService);
const logoutUser = new LogoutUser(jwtService);
const refreshToken = new RefreshToken(jwtService);
const searchAddresses = new SearchAddresses(googleRepository);
const createMapCategory = new CreateMapCategory(groupRepository, mapRepository);
const getMapCategories = new GetMapCategories(groupRepository, mapRepository);
const updateMapPoint = new UpdateMapPoint(groupRepository, mapRepository);
const updateUser = new UpdateUser(userRepository);
const getUser = new GetUser(userRepository);
const resetPassword = new ResetPassword(
    userRepository,
    emailService,
    config.frontendUrl,
);
const updateUserPassword = new UpdateUserPassword(userRepository);

const restInterface = new RestInterface(
    config.publicUrl,
    config.port,
    config.appVersion,
    config.appName,
    config.corsAllowedOrigins,
    config.validateApiResponses,
    {
        createGroupMap,
        createMapPoint,
        createUser,
        deleteMapPoints,
        getMapPoints,
        getUser,
        getUserGroups,
        loginUser,
        logoutUser,
        refreshToken,
        searchAddresses,
        getGroupMaps,
        createMapCategory,
        getMapCategories,
        updateMapPoint,
        updateUser,
        resetPassword,
        updateUserPassword,
    },
    jwtService,
);

process.on("SIGINT", async () => {
    LoggerService.info("Received SIGINT. Shutting down gracefully...");
    jwtService.destroy();
    await client.end();
    process.exit(0);
});

process.on("SIGTERM", async () => {
    LoggerService.info("Received SIGTERM. Shutting down gracefully...");
    jwtService.destroy();
    await client.end();
    process.exit(0);
});

// Start
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
