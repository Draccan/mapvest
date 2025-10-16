import AddressesManagerRepository from "../../src/core/dependencies/AddressesManagerRepository";
import AddressEntity from "../../src/core/entities/AddressEntity";
import { InMemoryRateLimitService } from "../../src/core/services/RateLimitService";
import JwtService from "../../src/core/services/JwtService";
import TokenBlacklistService from "../../src/core/services/TokenBlacklistService";
import CreateMapPoint from "../../src/core/usecases/CreateMapPoint";
import CreateUser from "../../src/core/usecases/CreateUser";
import GetMapPoints from "../../src/core/usecases/GetMapPoints";
import LoginUser from "../../src/core/usecases/LoginUser";
import LogoutUser from "../../src/core/usecases/LogoutUser";
import RefreshToken from "../../src/core/usecases/RefreshToken";
import SearchAddresses from "../../src/core/usecases/SearchAddresses";
import { DrizzleMapPointRepository } from "../../src/dependency-implementations/DrizzleMapPointRepository";
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

export function createTestApp() {
    const mapPointRepository = new DrizzleMapPointRepository();
    const userRepository = new DrizzleUserRepository();
    const googleRepository = new MockGoogleRepository();

    const rateLimitService = new InMemoryRateLimitService(1);
    const tokenBlacklistService = new TokenBlacklistService("test-jwt-secret");
    const jwtService = new JwtService("test-jwt-secret", tokenBlacklistService);

    const createMapPoint = new CreateMapPoint(
        mapPointRepository,
        rateLimitService,
    );
    const createUser = new CreateUser(userRepository);
    const getMapPoints = new GetMapPoints(mapPointRepository);
    const loginUser = new LoginUser(userRepository, jwtService);
    const logoutUser = new LogoutUser(jwtService);
    const refreshToken = new RefreshToken(jwtService);
    const searchAddresses = new SearchAddresses(googleRepository);

    const restInterface = new RestInterface(
        "http://localhost:3002",
        3002,
        "1.0.0-test",
        "FindInMap Test",
        ["*"],
        false,
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

    return restInterface;
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
    type: "THEFT",
    date: "01/01/2023",
};
