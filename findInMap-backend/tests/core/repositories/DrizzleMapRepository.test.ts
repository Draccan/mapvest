import { CreateMapPointDto } from "../../../src/core/dtos/CreateMapPointDto";
import { db } from "../../../src/db";
import {
    mapPoints,
    maps,
    groups,
    users,
    usersGroups,
} from "../../../src/db/schema";
import { DrizzleGroupRepository } from "../../../src/dependency-implementations/DrizzleGroupRepository";
import { DrizzleMapRepository } from "../../../src/dependency-implementations/DrizzleMapRepository";
import { DrizzleUserRepository } from "../../../src/dependency-implementations/DrizzleUserRepository";

describe("DrizzleMapRepository", () => {
    const repository: DrizzleMapRepository = new DrizzleMapRepository();
    const groupRepository: DrizzleGroupRepository =
        new DrizzleGroupRepository();
    const userRepository: DrizzleUserRepository = new DrizzleUserRepository();

    beforeEach(async () => {
        await db.delete(mapPoints);
        await db.delete(maps);
        await db.delete(usersGroups);
        await db.delete(groups);
        await db.delete(users);
    });

    describe("createMapPoint", () => {
        it("should createMapPoint a new map point in the database", async () => {
            const user = await userRepository.create({
                name: "Test",
                surname: "User",
                email: "test@example.com",
                password: "password123",
            });

            const group = await groupRepository.createGroup(
                "Test Group",
                user.id,
            );

            const map = await repository.createMap(group.id, {
                name: "Test Map",
            });

            const createMapPointDto: CreateMapPointDto = {
                long: 12.4964,
                lat: 41.9028,
                description: "Theft",
                date: "2024-01-01",
            };

            const result = await repository.createMapPoint(
                createMapPointDto,
                map.id,
            );

            expect(result).toBeDefined();
            expect(result.id).toBeDefined();
            expect(result.long).toBe(createMapPointDto.long);
            expect(result.lat).toBe(createMapPointDto.lat);
            expect(result.description).toBe(createMapPointDto.description);
            expect(result.created_at).toBeInstanceOf(Date);
            expect(result.updated_at).toBeInstanceOf(Date);
        });

        it("should handle different map point types", async () => {
            const user = await userRepository.create({
                name: "Test",
                surname: "User",
                email: "test@example.com",
                password: "password123",
            });

            const group = await groupRepository.createGroup(
                "Test Group",
                user.id,
            );

            const map = await repository.createMap(group.id, {
                name: "Test Map",
            });

            const testCases = [
                {
                    description: "Theft",
                    long: 10.0,
                    lat: 20.0,
                    date: "2024-01-01",
                },
                {
                    description: "Aggression",
                    long: 15.0,
                    lat: 25.0,
                    date: "2024-01-02",
                },
                {
                    description: "Robbery",
                    long: 20.0,
                    lat: 30.0,
                    date: "2024-01-03",
                },
            ];

            for (const testCase of testCases) {
                const result = await repository.createMapPoint(
                    testCase,
                    map.id,
                );
                expect(result.description).toBe(testCase.description);
                expect(result.long).toBe(testCase.long);
                expect(result.lat).toBe(testCase.lat);
            }
        });
    });

    describe("findAllMapPoints", () => {
        it("should return empty array when no map points exist for a map", async () => {
            const user = await userRepository.create({
                name: "Test",
                surname: "User",
                email: "test@example.com",
                password: "password123",
            });

            const group = await groupRepository.createGroup(
                "Test Group",
                user.id,
            );

            const map = await repository.createMap(group.id, {
                name: "Test Map",
            });

            const result = await repository.findAllMapPoints(map.id);
            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBe(0);
        });

        it("should return all map points when they exist", async () => {
            const user = await userRepository.create({
                name: "Test",
                surname: "User",
                email: "test@example.com",
                password: "password123",
            });

            const group = await groupRepository.createGroup(
                "Test Group",
                user.id,
            );

            const map = await repository.createMap(group.id, {
                name: "Test Map",
            });

            const testPoints = [
                {
                    long: 10,
                    lat: 20,
                    description: "Theft",
                    date: "2024-01-01",
                },
                {
                    long: 30,
                    lat: 40,
                    description: "Aggression",
                    date: "2024-01-02",
                },
                {
                    long: 50,
                    lat: 60,
                    description: "Robbery",
                    date: "2024-01-03",
                },
            ];

            for (const point of testPoints) {
                await repository.createMapPoint(point, map.id);
            }

            const result = await repository.findAllMapPoints(map.id);

            expect(result.length).toBe(3);
            expect(result.every((point) => point.id !== undefined)).toBe(true);
            expect(
                result.every((point) => point.created_at instanceof Date),
            ).toBe(true);
            expect(
                result.every((point) => point.updated_at instanceof Date),
            ).toBe(true);

            const types = result.map((point) => point.description);
            expect(types).toContain("Theft");
            expect(types).toContain("Aggression");
            expect(types).toContain("Robbery");
        });

        it("should preserve coordinate precision", async () => {
            const user = await userRepository.create({
                name: "Test",
                surname: "User",
                email: "test@example.com",
                password: "password123",
            });

            const group = await groupRepository.createGroup(
                "Test Group",
                user.id,
            );

            const map = await repository.createMap(group.id, {
                name: "Test Map",
            });

            const precisePoint = {
                long: 12.123456789,
                lat: 41.987654321,
                description: "Theft",
                date: "2024-01-01",
            };

            await repository.createMapPoint(precisePoint, map.id);
            const result = await repository.findAllMapPoints(map.id);

            expect(result.length).toBe(1);
            expect(result[0].long).toBeCloseTo(precisePoint.long, 6);
            expect(result[0].lat).toBeCloseTo(precisePoint.lat, 6);
        });

        it("should only return map points for the specified map", async () => {
            const user = await userRepository.create({
                name: "Test",
                surname: "User",
                email: "test@example.com",
                password: "password123",
            });

            const group = await groupRepository.createGroup(
                "Test Group",
                user.id,
            );

            const map1 = await repository.createMap(group.id, {
                name: "Map 1",
            });

            const map2 = await repository.createMap(group.id, {
                name: "Map 2",
            });

            await repository.createMapPoint(
                {
                    long: 10,
                    lat: 20,
                    description: "Theft",
                    date: "2024-01-01",
                },
                map1.id,
            );

            await repository.createMapPoint(
                {
                    long: 30,
                    lat: 40,
                    description: "Aggression",
                    date: "2024-01-02",
                },
                map2.id,
            );

            const result = await repository.findAllMapPoints(map1.id);

            expect(result.length).toBe(1);
            expect(result[0].description).toBe("Theft");
        });
    });

    describe("findMapByGroupId", () => {
        it("should return empty array when group has no maps", async () => {
            const user = await userRepository.create({
                name: "Test",
                surname: "User",
                email: "test@example.com",
                password: "password123",
            });

            const group = await groupRepository.createGroup(
                "Test Group",
                user.id,
            );

            const result = await repository.findMapByGroupId(group.id);

            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBe(0);
        });

        it("should return maps for a specific group", async () => {
            const user = await userRepository.create({
                name: "Test",
                surname: "User",
                email: "test@example.com",
                password: "password123",
            });

            const group = await groupRepository.createGroup(
                "Test Group",
                user.id,
            );

            const map1 = await repository.createMap(group.id, {
                name: "First Map",
            });

            const map2 = await repository.createMap(group.id, {
                name: "Second Map",
            });

            const result = await repository.findMapByGroupId(group.id);

            expect(result.length).toBe(2);
            expect(result.map((m) => m.id)).toContain(map1.id);
            expect(result.map((m) => m.id)).toContain(map2.id);
            expect(result.map((m) => m.name)).toContain("First Map");
            expect(result.map((m) => m.name)).toContain("Second Map");
        });

        it("should only return maps belonging to the specified group", async () => {
            const user = await userRepository.create({
                name: "Test",
                surname: "User",
                email: "test@example.com",
                password: "password123",
            });

            const group1 = await groupRepository.createGroup(
                "Group 1",
                user.id,
            );
            const group2 = await groupRepository.createGroup(
                "Group 2",
                user.id,
            );

            await repository.createMap(group1.id, {
                name: "Group 1 Map",
            });

            const group2Map = await repository.createMap(group2.id, {
                name: "Group 2 Map",
            });

            const result = await repository.findMapByGroupId(group2.id);

            expect(result.length).toBe(1);
            expect(result[0].id).toBe(group2Map.id);
            expect(result[0].name).toBe("Group 2 Map");
        });

        it("should return correct map structure with all fields", async () => {
            const user = await userRepository.create({
                name: "Test",
                surname: "User",
                email: "test@example.com",
                password: "password123",
            });

            const group = await groupRepository.createGroup(
                "Test Group",
                user.id,
            );

            await repository.createMap(group.id, {
                name: "Test Map",
            });

            const result = await repository.findMapByGroupId(group.id);

            expect(result.length).toBe(1);
            expect(typeof result[0].id).toBe("string");
            expect(result[0].groupId).toBe(group.id);
            expect(result[0].name).toBe("Test Map");
        });
    });

    describe("deleteMapPoints", () => {
        it("should delete map points by their ids", async () => {
            const user = await userRepository.create({
                name: "Test",
                surname: "User",
                email: "test@example.com",
                password: "password123",
            });

            const group = await groupRepository.createGroup(
                "Test Group",
                user.id,
            );

            const map = await repository.createMap(group.id, {
                name: "Test Map",
            });

            const point1 = await repository.createMapPoint(
                {
                    long: 12.4964,
                    lat: 41.9028,
                    description: "Theft",
                    date: "2024-01-01",
                },
                map.id,
            );

            const point2 = await repository.createMapPoint(
                {
                    long: 13.4964,
                    lat: 42.9028,
                    description: "Aggression",
                    date: "2024-01-02",
                },
                map.id,
            );

            const point3 = await repository.createMapPoint(
                {
                    long: 14.4964,
                    lat: 43.9028,
                    description: "Robbery",
                    date: "2024-01-03",
                },
                map.id,
            );

            await repository.deleteMapPoints(map.id, [point1.id, point2.id]);

            const remainingPoints = await repository.findAllMapPoints(map.id);

            expect(remainingPoints.length).toBe(1);
            expect(remainingPoints[0].id).toBe(point3.id);
        });

        it("should not delete points from other maps", async () => {
            const user = await userRepository.create({
                name: "Test",
                surname: "User",
                email: "test@example.com",
                password: "password123",
            });

            const group = await groupRepository.createGroup(
                "Test Group",
                user.id,
            );

            const map1 = await repository.createMap(group.id, {
                name: "Test Map 1",
            });

            const map2 = await repository.createMap(group.id, {
                name: "Test Map 2",
            });

            const point1 = await repository.createMapPoint(
                {
                    long: 12.4964,
                    lat: 41.9028,
                    description: "Theft",
                    date: "2024-01-01",
                },
                map1.id,
            );

            const point2 = await repository.createMapPoint(
                {
                    long: 13.4964,
                    lat: 42.9028,
                    description: "Aggression",
                    date: "2024-01-02",
                },
                map2.id,
            );

            await repository.deleteMapPoints(map2.id, [point1.id]);

            const map1Points = await repository.findAllMapPoints(map1.id);
            const map2Points = await repository.findAllMapPoints(map2.id);

            expect(map1Points.length).toBe(1);
            expect(map1Points[0].id).toBe(point1.id);

            expect(map2Points.length).toBe(1);
            expect(map2Points[0].id).toBe(point2.id);
        });

        it("should handle empty array", async () => {
            const user = await userRepository.create({
                name: "Test",
                surname: "User",
                email: "test@example.com",
                password: "password123",
            });

            const group = await groupRepository.createGroup(
                "Test Group",
                user.id,
            );

            const map = await repository.createMap(group.id, {
                name: "Test Map",
            });

            await repository.createMapPoint(
                {
                    long: 12.4964,
                    lat: 41.9028,
                    description: "Theft",
                    date: "2024-01-01",
                },
                map.id,
            );

            await repository.deleteMapPoints(map.id, []);

            const points = await repository.findAllMapPoints(map.id);
            expect(points.length).toBe(1);
        });

        it("should handle non-existing point ids correctly", async () => {
            const user = await userRepository.create({
                name: "Test",
                surname: "User",
                email: "test@example.com",
                password: "password123",
            });

            const group = await groupRepository.createGroup(
                "Test Group",
                user.id,
            );

            const map = await repository.createMap(group.id, {
                name: "Test Map",
            });

            const point = await repository.createMapPoint(
                {
                    long: 12.4964,
                    lat: 41.9028,
                    description: "Theft",
                    date: "2024-01-01",
                },
                map.id,
            );

            await repository.deleteMapPoints(map.id, [
                "00000000-0000-0000-0000-000000000001",
                "00000000-0000-0000-0000-000000000002",
            ]);

            const points = await repository.findAllMapPoints(map.id);
            expect(points.length).toBe(1);
            expect(points[0].id).toBe(point.id);
        });
    });
});
