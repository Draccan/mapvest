import EmailService from "../core/services/EmailService";
import LoggerService from "../core/services/LoggerService";
import JwtService from "../core/services/JwtService";
import TokenBlacklistService from "../core/services/TokenBlacklistService";
import AddUsersToGroup from "../core/usecases/AddUsersToGroup";
import CreateGroupMap from "../core/usecases/CreateGroupMap";
import CreateMapCategory from "../core/usecases/CreateMapCategory";
import CreateMapPoint from "../core/usecases/CreateMapPoint";
import CreateUser from "../core/usecases/CreateUser";
import DeleteMap from "../core/usecases/DeleteMap";
import DeleteMapPoints from "../core/usecases/DeleteMapPoints";
import GetGroupMaps from "../core/usecases/GetGroupMaps";
import GetGroupUsers from "../core/usecases/GetGroupUsers";
import GetMapCategories from "../core/usecases/GetMapCategories";
import GetMapPoints from "../core/usecases/GetMapPoints";
import GetPublicMap from "../core/usecases/GetPublicMap";
import GetPublicMapCategories from "../core/usecases/GetPublicMapCategories";
import GetPublicMapPoints from "../core/usecases/GetPublicMapPoints";
import GetUser from "../core/usecases/GetUser";
import GetUserGroups from "../core/usecases/GetUserGroups";
import LoginUser from "../core/usecases/LoginUser";
import LogoutUser from "../core/usecases/LogoutUser";
import RefreshToken from "../core/usecases/RefreshToken";
import RemoveUserFromGroup from "../core/usecases/RemoveUserFromGroup";
import ResetPassword from "../core/usecases/ResetPassword";
import SearchAddresses from "../core/usecases/SearchAddresses";
import UpdateGroup from "../core/usecases/UpdateGroup";
import UpdateMap from "../core/usecases/UpdateMap";
import UpdateMapPoint from "../core/usecases/UpdateMapPoint";
import UpdateUser from "../core/usecases/UpdateUser";
import UpdateUserInGroup from "../core/usecases/UpdateUserInGroup";
import UpdateUserPassword from "../core/usecases/UpdateUserPassword";
import { client } from "../db";
import { DrizzleGroupRepository } from "../dependency-implementations/DrizzleGroupRepository";
import { DrizzleMapRepository } from "../dependency-implementations/DrizzleMapRepository";
import { DrizzleUserRepository } from "../dependency-implementations/DrizzleUserRepository";
import GoogleRepository from "../dependency-implementations/GoogleRepository";
import RestInterface from "../interfaces/rest";
import config from "./config";

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
    config.resendApiKey,
    config.resendFromEmail,
    config.resendFromName,
);

// Usecases
const getMapPoints = new GetMapPoints(groupRepository, mapRepository);
const createMapPoint = new CreateMapPoint(groupRepository, mapRepository);
const deleteMap = new DeleteMap(groupRepository, mapRepository);
const deleteMapPoints = new DeleteMapPoints(groupRepository, mapRepository);
const createUser = new CreateUser(
    userRepository,
    groupRepository,
    mapRepository,
);
const createGroupMap = new CreateGroupMap(mapRepository, groupRepository);
const getGroupMaps = new GetGroupMaps(mapRepository, groupRepository);
const getUserGroups = new GetUserGroups(groupRepository);
const getGroupUsers = new GetGroupUsers(groupRepository, userRepository);
const loginUser = new LoginUser(userRepository, jwtService);
const logoutUser = new LogoutUser(jwtService);
const refreshToken = new RefreshToken(jwtService);
const searchAddresses = new SearchAddresses(googleRepository);
const createMapCategory = new CreateMapCategory(groupRepository, mapRepository);
const getMapCategories = new GetMapCategories(groupRepository, mapRepository);
const updateMapPoint = new UpdateMapPoint(groupRepository, mapRepository);
const updateMap = new UpdateMap(mapRepository, groupRepository);
const updateGroup = new UpdateGroup(groupRepository);
const addUsersToGroup = new AddUsersToGroup(groupRepository, userRepository);
const removeUserFromGroup = new RemoveUserFromGroup(groupRepository);
const updateUser = new UpdateUser(userRepository);
const updateUserInGroup = new UpdateUserInGroup(groupRepository);
const getUser = new GetUser(userRepository);
const getPublicMap = new GetPublicMap(mapRepository);
const getPublicMapCategories = new GetPublicMapCategories(mapRepository);
const getPublicMapPoints = new GetPublicMapPoints(mapRepository);
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
        deleteMap,
        deleteMapPoints,
        getGroupMaps,
        getGroupUsers,
        getMapPoints,
        getPublicMap,
        getPublicMapCategories,
        getPublicMapPoints,
        getUser,
        getUserGroups,
        loginUser,
        logoutUser,
        refreshToken,
        searchAddresses,
        createMapCategory,
        getMapCategories,
        updateMapPoint,
        updateMap,
        updateGroup,
        addUsersToGroup,
        removeUserFromGroup,
        updateUser,
        updateUserInGroup,
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
