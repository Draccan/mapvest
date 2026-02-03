import CreateCategoryDto from "../../../src/core/dtos/CreateCategoryDto";
import CreateMapPointDto from "../../../src/core/dtos/CreateMapPointDto";
import { db } from "../../../src/db";
import {
    mapPoints,
    mapCategories,
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
        await db.delete(mapCategories);
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

    describe("createCategory", () => {
        it("should create a new category in the database", async () => {
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

            const createCategoryDto: CreateCategoryDto = {
                description: "Furto",
                color: "#FF0000",
            };

            const result = await repository.createCategory(
                map.id,
                createCategoryDto,
            );

            expect(result).toBeDefined();
            expect(result.id).toBeDefined();
            expect(result.description).toBe(createCategoryDto.description);
            expect(result.color).toBe(createCategoryDto.color);
            expect(result.map_id).toBe(map.id);
            expect(result.created_at).toBeInstanceOf(Date);
            expect(result.updated_at).toBeInstanceOf(Date);
        });
    });

    describe("findCategoriesByMapId", () => {
        it("should return all categories for a map", async () => {
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

            await repository.createCategory(map.id, {
                description: "Furto",
                color: "#FF0000",
            });

            await repository.createCategory(map.id, {
                description: "Rapina",
                color: "#00FF00",
            });

            const result = await repository.findCategoriesByMapId(map.id);

            expect(result).toHaveLength(2);
            expect(result[0].description).toBe("Furto");
            expect(result[1].description).toBe("Rapina");
        });

        it("should return empty array if no categories exist", async () => {
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

            const result = await repository.findCategoriesByMapId(map.id);

            expect(result).toHaveLength(0);
        });
    });

    describe("updateMapPoint", () => {
        it("should update a map point successfully", async () => {
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

            const updatedPoint = await repository.updateMapPoint(
                point.id,
                map.id,
                {
                    description: "Updated Theft",
                    date: "2024-01-15",
                },
            );

            expect(updatedPoint!.id).toBe(point.id);
            expect(updatedPoint!.description).toBe("Updated Theft");
            expect(updatedPoint!.date).toBe("2024-01-15");
            expect(updatedPoint!.long).toBe(12.4964);
            expect(updatedPoint!.lat).toBe(41.9028);
        });

        it("should update only the provided fields", async () => {
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

            const category = await repository.createCategory(map.id, {
                description: "Furto",
                color: "#FF0000",
            });

            const point = await repository.createMapPoint(
                {
                    long: 12.4964,
                    lat: 41.9028,
                    description: "Theft",
                    date: "2024-01-01",
                    categoryId: category.id,
                },
                map.id,
            );

            const updatedPoint = await repository.updateMapPoint(
                point.id,
                map.id,
                {
                    description: "Updated Description Only",
                    date: point.date,
                    categoryId: point.category_id,
                },
            );

            expect(updatedPoint!.description).toBe("Updated Description Only");
            expect(updatedPoint!.date).toBe("2024-01-01");
            expect(updatedPoint!.category_id).toBe(category.id);
        });

        it("should update category of a map point", async () => {
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

            const category1 = await repository.createCategory(map.id, {
                description: "Furto",
                color: "#FF0000",
            });

            const category2 = await repository.createCategory(map.id, {
                description: "Rapina",
                color: "#00FF00",
            });

            const point = await repository.createMapPoint(
                {
                    long: 12.4964,
                    lat: 41.9028,
                    description: "Theft",
                    date: "2024-01-01",
                    categoryId: category1.id,
                },
                map.id,
            );

            const updatedPoint = await repository.updateMapPoint(
                point.id,
                map.id,
                {
                    description: point.description,
                    date: point.date,
                    categoryId: category2.id,
                },
            );

            expect(updatedPoint!.category_id).toBe(category2.id);
        });

        it("should create and update map point with dueDate", async () => {
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
                    dueDate: "2024-01-15",
                },
                map.id,
            );

            expect(point.due_date).toBe("2024-01-15");

            const updatedPoint = await repository.updateMapPoint(
                point.id,
                map.id,
                {
                    description: "Updated Theft",
                    date: "2024-01-01",
                    dueDate: "2024-01-20",
                },
            );

            expect(updatedPoint!.due_date).toBe("2024-01-20");
        });

        it("should create and update map point with notes", async () => {
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
                    notes: "Initial notes about this location",
                },
                map.id,
            );

            expect(point.notes).toBe("Initial notes about this location");

            const updatedPoint = await repository.updateMapPoint(
                point.id,
                map.id,
                {
                    description: "Updated Theft",
                    date: "2024-01-01",
                    notes: "Updated notes with more details",
                },
            );

            expect(updatedPoint!.notes).toBe("Updated notes with more details");
        });

        it("should create map point without notes and update to add notes", async () => {
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

            expect(point.notes).toBeUndefined();

            const updatedPoint = await repository.updateMapPoint(
                point.id,
                map.id,
                {
                    description: "Theft",
                    date: "2024-01-01",
                    notes: "Added notes later",
                },
            );

            expect(updatedPoint!.notes).toBe("Added notes later");
        });
    });

    describe("updateMap", () => {
        it("should update a map name", async () => {
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
                name: "Original Map Name",
            });

            const updatedMap = await repository.updateMap(map.id, group.id, {
                name: "Updated Map Name",
            });

            expect(updatedMap).toBeDefined();
            expect(updatedMap!.id).toBe(map.id);
            expect(updatedMap!.name).toBe("Updated Map Name");
            expect(updatedMap!.groupId).toBe(group.id);
            expect(updatedMap!.isPublic).toBe(false);
            expect(updatedMap!.publicId).toBeNull();
        });

        it("should return null when updating a non-existent map", async () => {
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

            const updatedMap = await repository.updateMap(
                "00000000-0000-0000-0000-000000000000",
                group.id,
                { name: "New Name" },
            );

            expect(updatedMap).toBeNull();
        });

        it("should not update a map if groupId does not match", async () => {
            const user = await userRepository.create({
                name: "Test",
                surname: "User",
                email: "test@example.com",
                password: "password123",
            });

            const group1 = await groupRepository.createGroup(
                "Test Group 1",
                user.id,
            );

            const group2 = await groupRepository.createGroup(
                "Test Group 2",
                user.id,
            );

            const map = await repository.createMap(group1.id, {
                name: "Original Map Name",
            });

            const updatedMap = await repository.updateMap(map.id, group2.id, {
                name: "Updated Map Name",
            });

            expect(updatedMap).toBeNull();

            const maps = await repository.findMapByGroupId(group1.id);
            expect(maps[0].name).toBe("Original Map Name");
        });

        it("should set isPublic to true and generate publicId", async () => {
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

            const updatedMap = await repository.updateMap(map.id, group.id, {
                isPublic: true,
            });

            expect(updatedMap).toBeDefined();
            expect(updatedMap!.isPublic).toBe(true);
            expect(updatedMap!.publicId).toBeDefined();
            expect(typeof updatedMap!.publicId).toBe("string");
        });

        it("should set isPublic to false and remove publicId", async () => {
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

            await repository.updateMap(map.id, group.id, {
                isPublic: true,
            });

            const updatedMap = await repository.updateMap(map.id, group.id, {
                isPublic: false,
            });

            expect(updatedMap).toBeDefined();
            expect(updatedMap!.isPublic).toBe(false);
            expect(updatedMap!.publicId).toBeNull();
        });

        it("should update both name and isPublic together", async () => {
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
                name: "Original Name",
            });

            const updatedMap = await repository.updateMap(map.id, group.id, {
                name: "New Name",
                isPublic: true,
            });

            expect(updatedMap).toBeDefined();
            expect(updatedMap!.name).toBe("New Name");
            expect(updatedMap!.isPublic).toBe(true);
            expect(updatedMap!.publicId).toBeDefined();
        });

        it("should return existing map when payload is empty", async () => {
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

            const updatedMap = await repository.updateMap(map.id, group.id, {});

            expect(updatedMap).toBeDefined();
            expect(updatedMap!.id).toBe(map.id);
            expect(updatedMap!.name).toBe("Test Map");
            expect(updatedMap!.isPublic).toBe(false);
        });

        it("should not modify isPublic when not provided in payload", async () => {
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
                name: "Original Name",
            });

            await repository.updateMap(map.id, group.id, {
                isPublic: true,
            });

            const updatedMap = await repository.updateMap(map.id, group.id, {
                name: "New Name",
            });

            expect(updatedMap).toBeDefined();
            expect(updatedMap!.name).toBe("New Name");
            expect(updatedMap!.isPublic).toBe(true);
            expect(updatedMap!.publicId).toBeDefined();
        });
    });

    describe("deleteMap", () => {
        it("should delete a map and all associated data", async () => {
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
                    description: "Point 1",
                    date: "2024-01-01",
                },
                map.id,
            );

            await repository.createMapPoint(
                {
                    long: 13.4964,
                    lat: 42.9028,
                    description: "Point 2",
                    date: "2024-01-02",
                },
                map.id,
            );

            await repository.createCategory(map.id, {
                description: "Category 1",
                color: "#FF0000",
            });

            await repository.createCategory(map.id, {
                description: "Category 2",
                color: "#00FF00",
            });

            await repository.deleteMap(map.id);

            const maps = await repository.findMapByGroupId(group.id);
            expect(maps.length).toBe(0);

            const points = await repository.findAllMapPoints(map.id);
            expect(points.length).toBe(0);

            const categories = await repository.findCategoriesByMapId(map.id);
            expect(categories.length).toBe(0);
        });

        it("should only delete data for the specified map", async () => {
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
                    long: 12.4964,
                    lat: 41.9028,
                    description: "Point for Map 1",
                    date: "2024-01-01",
                },
                map1.id,
            );

            await repository.createMapPoint(
                {
                    long: 13.4964,
                    lat: 42.9028,
                    description: "Point for Map 2",
                    date: "2024-01-02",
                },
                map2.id,
            );

            await repository.createCategory(map1.id, {
                description: "Category for Map 1",
                color: "#FF0000",
            });

            await repository.createCategory(map2.id, {
                description: "Category for Map 2",
                color: "#00FF00",
            });

            await repository.deleteMap(map1.id);

            const maps = await repository.findMapByGroupId(group.id);
            expect(maps.length).toBe(1);
            expect(maps[0].id).toBe(map2.id);

            const map1Points = await repository.findAllMapPoints(map1.id);
            expect(map1Points.length).toBe(0);

            const map2Points = await repository.findAllMapPoints(map2.id);
            expect(map2Points.length).toBe(1);

            const map1Categories = await repository.findCategoriesByMapId(
                map1.id,
            );
            expect(map1Categories.length).toBe(0);

            const map2Categories = await repository.findCategoriesByMapId(
                map2.id,
            );
            expect(map2Categories.length).toBe(1);
        });

        it("should handle deleting a map with no points or categories", async () => {
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
                name: "Empty Map",
            });

            await repository.deleteMap(map.id);

            const maps = await repository.findMapByGroupId(group.id);
            expect(maps.length).toBe(0);
        });

        it("should handle deleting non-existent map gracefully", async () => {
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

            await repository.deleteMap("00000000-0000-0000-0000-000000000000");
        });
    });

    describe("deleteMapCategory", () => {
        it("should delete a category and remove it from all map points", async () => {
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

            const category = await repository.createCategory(map.id, {
                description: "Furto",
                color: "#FF0000",
            });

            await repository.createMapPoint(
                {
                    long: 12.4964,
                    lat: 41.9028,
                    description: "Point 1",
                    date: "2024-01-01",
                    categoryId: category.id,
                },
                map.id,
            );

            await repository.createMapPoint(
                {
                    long: 13.4964,
                    lat: 42.9028,
                    description: "Point 2",
                    date: "2024-01-02",
                    categoryId: category.id,
                },
                map.id,
            );

            await repository.deleteMapCategory(map.id, category.id);

            const categories = await repository.findCategoriesByMapId(map.id);
            expect(categories.length).toBe(0);

            const points = await repository.findAllMapPoints(map.id);
            expect(points.length).toBe(2);
            expect(points[0].category_id).toBeFalsy();
            expect(points[1].category_id).toBeFalsy();
        });

        it("should only remove category from points of the specified map", async () => {
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

            const category1 = await repository.createCategory(map1.id, {
                description: "Category for Map 1",
                color: "#FF0000",
            });

            const category2 = await repository.createCategory(map2.id, {
                description: "Category for Map 2",
                color: "#00FF00",
            });

            await repository.createMapPoint(
                {
                    long: 12.4964,
                    lat: 41.9028,
                    description: "Point for Map 1",
                    date: "2024-01-01",
                    categoryId: category1.id,
                },
                map1.id,
            );

            await repository.createMapPoint(
                {
                    long: 13.4964,
                    lat: 42.9028,
                    description: "Point for Map 2",
                    date: "2024-01-02",
                    categoryId: category2.id,
                },
                map2.id,
            );

            await repository.deleteMapCategory(map1.id, category1.id);

            const map1Categories = await repository.findCategoriesByMapId(
                map1.id,
            );
            expect(map1Categories.length).toBe(0);

            const map2Categories = await repository.findCategoriesByMapId(
                map2.id,
            );
            expect(map2Categories.length).toBe(1);
            expect(map2Categories[0].id).toBe(category2.id);

            const map1Points = await repository.findAllMapPoints(map1.id);
            expect(map1Points[0].category_id).toBeFalsy();

            const map2Points = await repository.findAllMapPoints(map2.id);
            expect(map2Points[0].category_id).toBe(category2.id);
        });

        it("should handle deleting category that has no associated points", async () => {
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

            const category = await repository.createCategory(map.id, {
                description: "Unused Category",
                color: "#FF0000",
            });

            await repository.deleteMapCategory(map.id, category.id);

            const categories = await repository.findCategoriesByMapId(map.id);
            expect(categories.length).toBe(0);
        });

        it("should handle deleting non-existent category gracefully", async () => {
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

            await repository.deleteMapCategory(
                map.id,
                "00000000-0000-0000-0000-000000000000",
            );
        });

        it("should not delete category if mapId does not match", async () => {
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

            const category = await repository.createCategory(map1.id, {
                description: "Category for Map 1",
                color: "#FF0000",
            });

            await repository.deleteMapCategory(map2.id, category.id);

            const categories = await repository.findCategoriesByMapId(map1.id);
            expect(categories.length).toBe(1);
            expect(categories[0].id).toBe(category.id);
        });

        it("should preserve points without category when deleting a category", async () => {
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

            const category = await repository.createCategory(map.id, {
                description: "Furto",
                color: "#FF0000",
            });

            await repository.createMapPoint(
                {
                    long: 12.4964,
                    lat: 41.9028,
                    description: "Point with category",
                    date: "2024-01-01",
                    categoryId: category.id,
                },
                map.id,
            );

            await repository.createMapPoint(
                {
                    long: 13.4964,
                    lat: 42.9028,
                    description: "Point without category",
                    date: "2024-01-02",
                },
                map.id,
            );

            await repository.deleteMapCategory(map.id, category.id);

            const points = await repository.findAllMapPoints(map.id);
            expect(points.length).toBe(2);
            expect(points.every((p) => !p.category_id)).toBe(true);
        });
    });

    describe("updateCategory", () => {
        it("should update a category successfully", async () => {
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

            const category = await repository.createCategory(map.id, {
                description: "Original Description",
                color: "#FF0000",
            });

            const updatedCategory = await repository.updateCategory(
                map.id,
                category.id,
                {
                    description: "Updated Description",
                    color: "#00FF00",
                },
            );

            expect(updatedCategory).toBeDefined();
            expect(updatedCategory!.id).toBe(category.id);
            expect(updatedCategory!.description).toBe("Updated Description");
            expect(updatedCategory!.color).toBe("#00FF00");
            expect(updatedCategory!.map_id).toBe(map.id);
        });

        it("should return null when category does not exist", async () => {
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

            const updatedCategory = await repository.updateCategory(
                map.id,
                "00000000-0000-0000-0000-000000000000",
                {
                    description: "Updated Description",
                    color: "#00FF00",
                },
            );

            expect(updatedCategory).toBeNull();
        });

        it("should return null when mapId does not match", async () => {
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

            const category = await repository.createCategory(map1.id, {
                description: "Original Description",
                color: "#FF0000",
            });

            const updatedCategory = await repository.updateCategory(
                map2.id,
                category.id,
                {
                    description: "Updated Description",
                    color: "#00FF00",
                },
            );

            expect(updatedCategory).toBeNull();

            const categories = await repository.findCategoriesByMapId(map1.id);
            expect(categories[0].description).toBe("Original Description");
            expect(categories[0].color).toBe("#FF0000");
        });

        it("should update only the specified category", async () => {
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

            const category1 = await repository.createCategory(map.id, {
                description: "Category 1",
                color: "#FF0000",
            });

            const category2 = await repository.createCategory(map.id, {
                description: "Category 2",
                color: "#0000FF",
            });

            await repository.updateCategory(map.id, category1.id, {
                description: "Updated Category 1",
                color: "#00FF00",
            });

            const categories = await repository.findCategoriesByMapId(map.id);
            const updatedCategory1 = categories.find(
                (c) => c.id === category1.id,
            );
            const unchangedCategory2 = categories.find(
                (c) => c.id === category2.id,
            );

            expect(updatedCategory1!.description).toBe("Updated Category 1");
            expect(updatedCategory1!.color).toBe("#00FF00");
            expect(unchangedCategory2!.description).toBe("Category 2");
            expect(unchangedCategory2!.color).toBe("#0000FF");
        });
    });

    describe("findMapByPublicId", () => {
        it("should return a map when publicId exists", async () => {
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

            const updatedMap = await repository.updateMap(map.id, group.id, {
                isPublic: true,
            });

            const result = await repository.findMapByPublicId(
                updatedMap!.publicId!,
            );

            expect(result).toBeDefined();
            expect(result!.id).toBe(map.id);
            expect(result!.name).toBe("Test Map");
            expect(result!.publicId).toBe(updatedMap!.publicId);
        });

        it("should return null when publicId does not exist", async () => {
            const result = await repository.findMapByPublicId(
                "00000000-0000-0000-0000-000000000000",
            );

            expect(result).toBeNull();
        });

        it("should return null when map is not public", async () => {
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
                name: "Private Map",
            });

            const result = await repository.findMapByPublicId(map.id);

            expect(result).toBeNull();
        });
    });

    describe("createMapPoints", () => {
        it("should create multiple map points in bulk", async () => {
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

            const pointsData: CreateMapPointDto[] = [
                {
                    long: 12.4964,
                    lat: 41.9028,
                    description: "Point 1",
                    date: "2024-01-01",
                },
                {
                    long: 9.19,
                    lat: 45.4642,
                    description: "Point 2",
                    date: "2024-01-02",
                    notes: "Some notes",
                },
                {
                    long: 11.2558,
                    lat: 43.7696,
                    description: "Point 3",
                    date: "2024-01-03",
                    dueDate: "2024-02-01",
                },
            ];

            const result = await repository.createMapPoints(pointsData, map.id);

            expect(result).toHaveLength(3);
            expect(result[0].description).toBe("Point 1");
            expect(result[0].long).toBe(12.4964);
            expect(result[0].lat).toBe(41.9028);
            expect(result[1].description).toBe("Point 2");
            expect(result[1].notes).toBe("Some notes");
            expect(result[2].description).toBe("Point 3");
            expect(result[2].due_date).toBe("2024-02-01");
        });

        it("should return empty array when given empty array", async () => {
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

            const result = await repository.createMapPoints([], map.id);

            expect(result).toEqual([]);
        });

        it("should create map points with category", async () => {
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

            const category = await repository.createCategory(map.id, {
                description: "Test Category",
                color: "#FF0000",
            });

            const pointsData: CreateMapPointDto[] = [
                {
                    long: 12.4964,
                    lat: 41.9028,
                    description: "Categorized Point",
                    date: "2024-01-01",
                    categoryId: category.id,
                },
            ];

            const result = await repository.createMapPoints(pointsData, map.id);

            expect(result).toHaveLength(1);
            expect(result[0].category_id).toBe(category.id);
        });

        it("should create all points with correct timestamps", async () => {
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

            const pointsData: CreateMapPointDto[] = [
                {
                    long: 12.4964,
                    lat: 41.9028,
                    description: "Point 1",
                    date: "2024-01-01",
                },
                {
                    long: 9.19,
                    lat: 45.4642,
                    description: "Point 2",
                    date: "2024-01-02",
                },
            ];

            const result = await repository.createMapPoints(pointsData, map.id);

            expect(result[0].created_at).toBeInstanceOf(Date);
            expect(result[0].updated_at).toBeInstanceOf(Date);
            expect(result[1].created_at).toBeInstanceOf(Date);
            expect(result[1].updated_at).toBeInstanceOf(Date);
        });
    });

    describe("memoizedFindCategoriesByMapId", () => {
        it("should return categories for a map", async () => {
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

            await repository.createCategory(map.id, {
                description: "Category 1",
                color: "#FF0000",
            });

            await repository.createCategory(map.id, {
                description: "Category 2",
                color: "#00FF00",
            });

            const result = await repository.memoizedFindCategoriesByMapId(
                map.id,
            );

            expect(result).toHaveLength(2);
            expect(result.map((c) => c.description)).toContain("Category 1");
            expect(result.map((c) => c.description)).toContain("Category 2");
        });

        it("should return empty array when no categories exist", async () => {
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

            const result = await repository.memoizedFindCategoriesByMapId(
                map.id,
            );

            expect(result).toEqual([]);
        });

        it("should cache results for subsequent calls", async () => {
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

            await repository.createCategory(map.id, {
                description: "Category 1",
                color: "#FF0000",
            });

            const result1 = await repository.memoizedFindCategoriesByMapId(
                map.id,
            );
            const result2 = await repository.memoizedFindCategoriesByMapId(
                map.id,
            );

            expect(result1).toEqual(result2);
        });
    });
});
