import AddressesManagerRepository from "../src/core/dependencies/AddressesManagerRepository";
import GroupRepository from "../src/core/dependencies/GroupRepository";
import MapRepository from "../src/core/dependencies/MapRepository";
import UserRepository from "../src/core/dependencies/UserRepository";
import AddressEntity from "../src/core/entities/AddressEntity";
import EmailService, { EmailOptions } from "../src/core/services/EmailService";
import JwtService from "../src/core/services/JwtService";
import TokenBlacklistService from "../src/core/services/TokenBlacklistService";
import AddUsersToGroup from "../src/core/usecases/AddUsersToGroup";
import CreateGroupMap from "../src/core/usecases/CreateGroupMap";
import CreateMapCategory from "../src/core/usecases/CreateMapCategory";
import CreateMapPoint from "../src/core/usecases/CreateMapPoint";
import CreateUser from "../src/core/usecases/CreateUser";
import DeleteMap from "../src/core/usecases/DeleteMap";
import DeleteMapPoints from "../src/core/usecases/DeleteMapPoints";
import GetGroupMaps from "../src/core/usecases/GetGroupMaps";
import GetGroupUsers from "../src/core/usecases/GetGroupUsers";
import GetMapCategories from "../src/core/usecases/GetMapCategories";
import GetMapPoints from "../src/core/usecases/GetMapPoints";
import GetPublicMap from "../src/core/usecases/GetPublicMap";
import GetPublicMapCategories from "../src/core/usecases/GetPublicMapCategories";
import GetPublicMapPoints from "../src/core/usecases/GetPublicMapPoints";
import GetUser from "../src/core/usecases/GetUser";
import GetUserGroups from "../src/core/usecases/GetUserGroups";
import LoginUser from "../src/core/usecases/LoginUser";
import LogoutUser from "../src/core/usecases/LogoutUser";
import RefreshToken from "../src/core/usecases/RefreshToken";
import RemoveUserFromGroup from "../src/core/usecases/RemoveUserFromGroup";
import ResetPassword from "../src/core/usecases/ResetPassword";
import SearchAddresses from "../src/core/usecases/SearchAddresses";
import UpdateGroup from "../src/core/usecases/UpdateGroup";
import UpdateMap from "../src/core/usecases/UpdateMap";
import UpdateMapPoint from "../src/core/usecases/UpdateMapPoint";
import UpdateUser from "../src/core/usecases/UpdateUser";
import UpdateUserInGroup from "../src/core/usecases/UpdateUserInGroup";
import UpdateUserPassword from "../src/core/usecases/UpdateUserPassword";
import { DrizzleGroupRepository } from "../src/dependency-implementations/DrizzleGroupRepository";
import { DrizzleMapRepository } from "../src/dependency-implementations/DrizzleMapRepository";
import { DrizzleUserRepository } from "../src/dependency-implementations/DrizzleUserRepository";
import RestInterface from "../src/interfaces/rest";

export const mockGroupRepository: jest.Mocked<GroupRepository> = {
    findByUserId: jest.fn(),
    memoizedFindByUserId: jest.fn(),
    findUsersByGroupId: jest.fn(),
    createGroup: jest.fn(),
    addUserToGroup: jest.fn(),
    addUsersToGroup: jest.fn(),
    removeUserFromGroup: jest.fn(),
    updateGroup: jest.fn(),
    updateUserInGroup: jest.fn(),
};

export const mockMapRepository: jest.Mocked<MapRepository> = {
    findAllMapPoints: jest.fn(),
    findMapByPublicId: jest.fn(),
    findMapByGroupId: jest.fn(),
    createMapPoint: jest.fn(),
    findMapPointById: jest.fn(),
    deleteMapPoints: jest.fn(),
    deleteMap: jest.fn(),
    memoizedFindMapByGroupId: jest.fn(),
    createMap: jest.fn(),
    createCategory: jest.fn(),
    findCategoriesByMapId: jest.fn(),
    updateMapPoint: jest.fn(),
    updateMap: jest.fn(),
    invalidateMapsCache: jest.fn(),
};

export const mockUserRepository: jest.Mocked<UserRepository> = {
    create: jest.fn(),
    findByEmail: jest.fn(),
    findById: jest.fn(),
    findByIds: jest.fn(),
    findByEmails: jest.fn(),
    updatePassword: jest.fn(),
    createPasswordResetToken: jest.fn(),
    deletePasswordResetTokensByUserId: jest.fn(),
    deletePasswordResetToken: jest.fn(),
    findPasswordResetTokenData: jest.fn(),
};

class MockGoogleRepository implements AddressesManagerRepository {
    async findByText(text: string): Promise<AddressEntity[]> {
        return [
            {
                formattedAddress: text,
                name: text,
                location: {
                    latitude: 1,
                    longitude: 1,
                },
            },
        ];
    }
}

class MockEmailService extends EmailService {
    public sentEmails: EmailOptions[] = [];

    constructor() {
        super("mock-resend-api-key", "mock@test.com", "Mock Service");
    }

    async sendEmail(options: EmailOptions): Promise<void> {
        this.sentEmails.push(options);
    }

    async sendPasswordResetEmail(
        to: string,
        resetToken: string,
        frontendUrl: string,
    ): Promise<void> {
        this.sentEmails.push({
            to,
            subject: "Reset Password - MapVest",
            html: `Reset link: ${frontendUrl}/reset-password?token=${resetToken}`,
        });
    }

    clearSentEmails(): void {
        this.sentEmails = [];
    }
}

const tokenBlacklistService = new TokenBlacklistService("test-jwt-secret");
const jwtService: JwtService = new JwtService(
    "test-jwt-secret",
    tokenBlacklistService,
);
const mockEmailService = new MockEmailService();

export function createTestApp() {
    const groupRepository = new DrizzleGroupRepository();
    const mapRepository = new DrizzleMapRepository();
    const userRepository = new DrizzleUserRepository();
    const googleRepository = new MockGoogleRepository();

    const createMapPoint = new CreateMapPoint(groupRepository, mapRepository);
    const createUser = new CreateUser(
        userRepository,
        groupRepository,
        mapRepository,
    );
    const createGroupMap = new CreateGroupMap(mapRepository, groupRepository);
    const createMapCategory = new CreateMapCategory(
        groupRepository,
        mapRepository,
    );
    const deleteMap = new DeleteMap(groupRepository, mapRepository);
    const deleteMapPoints = new DeleteMapPoints(groupRepository, mapRepository);
    const getGroupMaps = new GetGroupMaps(mapRepository, groupRepository);
    const getGroupUsers = new GetGroupUsers(groupRepository, userRepository);
    const getMapCategories = new GetMapCategories(
        groupRepository,
        mapRepository,
    );
    const getMapPoints = new GetMapPoints(groupRepository, mapRepository);
    const getUser = new GetUser(userRepository);
    const getPublicMap = new GetPublicMap(mapRepository);
    const getPublicMapCategories = new GetPublicMapCategories(mapRepository);
    const getPublicMapPoints = new GetPublicMapPoints(mapRepository);
    const getUserGroups = new GetUserGroups(groupRepository);
    const loginUser = new LoginUser(userRepository, jwtService);
    const logoutUser = new LogoutUser(jwtService);
    const refreshToken = new RefreshToken(jwtService);
    const searchAddresses = new SearchAddresses(googleRepository);
    const updateMap = new UpdateMap(mapRepository, groupRepository);
    const updateGroup = new UpdateGroup(groupRepository);
    const addUsersToGroup = new AddUsersToGroup(
        groupRepository,
        userRepository,
    );
    const removeUserFromGroup = new RemoveUserFromGroup(groupRepository);
    const updateMapPoint = new UpdateMapPoint(groupRepository, mapRepository);
    const updateUser = new UpdateUser(userRepository);
    const updateUserInGroup = new UpdateUserInGroup(groupRepository);
    const resetPassword = new ResetPassword(
        userRepository,
        mockEmailService,
        "http://localhost:3000",
    );
    const updateUserPassword = new UpdateUserPassword(userRepository);

    const restInterface = new RestInterface(
        "http://localhost:3002",
        3002,
        "1.0.0-test",
        "FindInMap Test",
        ["*"],
        true,
        {
            createGroupMap,
            createMapCategory,
            createMapPoint,
            createUser,
            deleteMap,
            deleteMapPoints,
            getGroupMaps,
            getGroupUsers,
            getMapCategories,
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
            updateMap,
            updateGroup,
            addUsersToGroup,
            removeUserFromGroup,
            updateMapPoint,
            updateUser,
            updateUserInGroup,
            resetPassword,
            updateUserPassword,
        },
        jwtService,
    );

    return restInterface;
}

export function getMockEmailService() {
    return mockEmailService;
}

export function cleanupTestApp() {
    if (jwtService) {
        jwtService.destroy();
    }
}

export const testUser = {
    name: "Test",
    surname: "User",
    email: "test@example.com",
    password: "testpass123",
};

export const testMapPoint = {
    long: 45.4642,
    lat: 9.19,
    description: "THEFT",
    date: "2025-12-03",
};
