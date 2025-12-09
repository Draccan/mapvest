import AddressesManagerRepository from "../../src/core/dependencies/AddressesManagerRepository";
import AddressEntity from "../../src/core/entities/AddressEntity";
import EmailService, {
    EmailOptions,
} from "../../src/core/services/EmailService";
import JwtService from "../../src/core/services/JwtService";
import TokenBlacklistService from "../../src/core/services/TokenBlacklistService";
import CreateGroupMap from "../../src/core/usecases/CreateGroupMap";
import CreateMapCategory from "../../src/core/usecases/CreateMapCategory";
import CreateMapPoint from "../../src/core/usecases/CreateMapPoint";
import CreateUser from "../../src/core/usecases/CreateUser";
import DeleteMapPoints from "../../src/core/usecases/DeleteMapPoints";
import GetGroupMaps from "../../src/core/usecases/GetGroupMaps";
import GetMapCategories from "../../src/core/usecases/GetMapCategories";
import GetMapPoints from "../../src/core/usecases/GetMapPoints";
import GetUser from "../../src/core/usecases/GetUser";
import GetUserGroups from "../../src/core/usecases/GetUserGroups";
import LoginUser from "../../src/core/usecases/LoginUser";
import LogoutUser from "../../src/core/usecases/LogoutUser";
import RefreshToken from "../../src/core/usecases/RefreshToken";
import ResetPassword from "../../src/core/usecases/ResetPassword";
import SearchAddresses from "../../src/core/usecases/SearchAddresses";
import UpdateMapPoint from "../../src/core/usecases/UpdateMapPoint";
import UpdateUser from "../../src/core/usecases/UpdateUser";
import UpdateUserPassword from "../../src/core/usecases/UpdateUserPassword";
import { DrizzleGroupRepository } from "../../src/dependency-implementations/DrizzleGroupRepository";
import { DrizzleMapRepository } from "../../src/dependency-implementations/DrizzleMapRepository";
import { DrizzleUserRepository } from "../../src/dependency-implementations/DrizzleUserRepository";
import RestInterface from "../../src/interfaces/rest";

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
        super(
            "mock-smtp.test",
            587,
            "mock@test.com",
            "mock-password",
            "mock@test.com",
            "Mock Service",
        );
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
    const deleteMapPoints = new DeleteMapPoints(groupRepository, mapRepository);
    const getGroupMaps = new GetGroupMaps(mapRepository, groupRepository);
    const getMapCategories = new GetMapCategories(
        groupRepository,
        mapRepository,
    );
    const getMapPoints = new GetMapPoints(groupRepository, mapRepository);
    const getUser = new GetUser(userRepository);
    const getUserGroups = new GetUserGroups(groupRepository);
    const loginUser = new LoginUser(userRepository, jwtService);
    const logoutUser = new LogoutUser(jwtService);
    const refreshToken = new RefreshToken(jwtService);
    const searchAddresses = new SearchAddresses(googleRepository);
    const updateMapPoint = new UpdateMapPoint(groupRepository, mapRepository);
    const updateUser = new UpdateUser(userRepository);
    const resetPassword = new ResetPassword(
        userRepository,
        mockEmailService,
        "http://localhost:5173",
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
            deleteMapPoints,
            getGroupMaps,
            getMapCategories,
            getMapPoints,
            getUser,
            getUserGroups,
            loginUser,
            logoutUser,
            refreshToken,
            searchAddresses,
            updateMapPoint,
            updateUser,
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
