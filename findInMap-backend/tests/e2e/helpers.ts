import { InMemoryRateLimitService } from "../../src/core/services/RateLimitService";
import JwtService from "../../src/core/services/JwtService";
import CreateMapPoint from "../../src/core/usecases/CreateMapPoint";
import CreateUser from "../../src/core/usecases/CreateUser";
import GetMapPoints from "../../src/core/usecases/GetMapPoints";
import LoginUser from "../../src/core/usecases/LoginUser";
import { DrizzleMapPointRepository } from "../../src/dependency-implementations/DrizzleMapPointRepository";
import { DrizzleUserRepository } from "../../src/dependency-implementations/DrizzleUserRepository";
import RestInterface from "../../src/interfaces/rest";

export function createTestApp() {
    const mapPointRepository = new DrizzleMapPointRepository();
    const userRepository = new DrizzleUserRepository();

    const rateLimitService = new InMemoryRateLimitService(1);
    const jwtService = new JwtService("test-jwt-secret");

    const createMapPoint = new CreateMapPoint(
        mapPointRepository,
        rateLimitService,
    );
    const createUser = new CreateUser(userRepository);
    const getMapPoints = new GetMapPoints(mapPointRepository);
    const loginUser = new LoginUser(userRepository, jwtService);

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
        },
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
    x: 45.4642,
    y: 9.19,
    type: "THEFT",
    date: "01/01/2023",
};
