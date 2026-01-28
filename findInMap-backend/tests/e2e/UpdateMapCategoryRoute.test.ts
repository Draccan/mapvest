import request from "supertest";

import { DrizzleGroupRepository } from "../../src/dependency-implementations/DrizzleGroupRepository";
import { DrizzleMapRepository } from "../../src/dependency-implementations/DrizzleMapRepository";
import { getTestApp } from "./setup";

describe("Update Map Category Route", () => {
    it("PUT /:groupId/maps/:mapId/categories/:categoryId should update a category", async () => {
        const app = getTestApp();

        const uniqueUser = {
            name: "UpdateCategory",
            surname: "TestUser",
            email: `update-category-test-${Date.now()}${Math.random()}@example.com`,
            password: "testpass123",
        };

        await request(app).post("/users").send(uniqueUser);

        const loginResponse = await request(app).post("/users/login").send({
            email: uniqueUser.email,
            password: uniqueUser.password,
        });

        const accessToken = loginResponse.body.token;
        const userId = loginResponse.body.user.id;

        const groupRepository = new DrizzleGroupRepository();
        const group = await groupRepository.createGroup("Test Group", userId);
        const groupId = group.id;

        const mapRepository = new DrizzleMapRepository();
        const map = await mapRepository.createMap(groupId, {
            name: "Test Map",
        });
        const mapId = map.id;

        const category = await mapRepository.createCategory(mapId, {
            description: "Original Description",
            color: "#FF0000",
        });
        const categoryId = category.id;

        const response = await request(app)
            .put(`/${groupId}/maps/${mapId}/categories/${categoryId}`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ description: "Updated Description", color: "#00FF00" })
            .expect(200);

        expect(response.body).toHaveProperty("id");
        expect(response.body.id).toBe(categoryId);
        expect(response.body.description).toBe("Updated Description");
        expect(response.body.color).toBe("#00FF00");
    });

    it("PUT /:groupId/maps/:mapId/categories/:categoryId should return correct structure", async () => {
        const app = getTestApp();

        const uniqueUser = {
            name: "UpdateCategory",
            surname: "TestUser",
            email: `update-category-test-${Date.now()}${Math.random()}@example.com`,
            password: "testpass123",
        };

        await request(app).post("/users").send(uniqueUser);

        const loginResponse = await request(app).post("/users/login").send({
            email: uniqueUser.email,
            password: uniqueUser.password,
        });

        const accessToken = loginResponse.body.token;
        const userId = loginResponse.body.user.id;

        const groupRepository = new DrizzleGroupRepository();
        const group = await groupRepository.createGroup("Test Group", userId);
        const groupId = group.id;

        const mapRepository = new DrizzleMapRepository();
        const map = await mapRepository.createMap(groupId, {
            name: "Test Map",
        });
        const mapId = map.id;

        const category = await mapRepository.createCategory(mapId, {
            description: "Original",
            color: "#123456",
        });
        const categoryId = category.id;

        const response = await request(app)
            .put(`/${groupId}/maps/${mapId}/categories/${categoryId}`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ description: "New Description", color: "#654321" })
            .expect(200);

        expect(response.body).toHaveProperty("id");
        expect(response.body).toHaveProperty("description");
        expect(response.body).toHaveProperty("color");
        expect(typeof response.body.id).toBe("string");
        expect(typeof response.body.description).toBe("string");
        expect(typeof response.body.color).toBe("string");
    });

    it("PUT /:groupId/maps/:mapId/categories/:categoryId should return 401 without token", async () => {
        const app = getTestApp();

        const uniqueUser = {
            name: "UpdateCategory",
            surname: "TestUser",
            email: `update-category-test-${Date.now()}${Math.random()}@example.com`,
            password: "testpass123",
        };

        await request(app).post("/users").send(uniqueUser);

        const loginResponse = await request(app).post("/users/login").send({
            email: uniqueUser.email,
            password: uniqueUser.password,
        });

        const userId = loginResponse.body.user.id;

        const groupRepository = new DrizzleGroupRepository();
        const group = await groupRepository.createGroup("Test Group", userId);
        const groupId = group.id;

        const mapRepository = new DrizzleMapRepository();
        const map = await mapRepository.createMap(groupId, {
            name: "Test Map",
        });
        const mapId = map.id;

        const category = await mapRepository.createCategory(mapId, {
            description: "Original",
            color: "#FF0000",
        });
        const categoryId = category.id;

        await request(app)
            .put(`/${groupId}/maps/${mapId}/categories/${categoryId}`)
            .send({ description: "Updated", color: "#00FF00" })
            .expect(401);
    });

    it("PUT /:groupId/maps/:mapId/categories/:categoryId should return 403 when user cannot access group", async () => {
        const app = getTestApp();

        const uniqueUser1 = {
            name: "User1",
            surname: "TestUser",
            email: `user1-test-${Date.now()}${Math.random()}@example.com`,
            password: "testpass123",
        };

        const uniqueUser2 = {
            name: "User2",
            surname: "TestUser",
            email: `user2-test-${Date.now()}${Math.random()}@example.com`,
            password: "testpass123",
        };

        await request(app).post("/users").send(uniqueUser1);
        await request(app).post("/users").send(uniqueUser2);

        const loginResponse1 = await request(app).post("/users/login").send({
            email: uniqueUser1.email,
            password: uniqueUser1.password,
        });

        const loginResponse2 = await request(app).post("/users/login").send({
            email: uniqueUser2.email,
            password: uniqueUser2.password,
        });

        const accessToken2 = loginResponse2.body.token;
        const userId1 = loginResponse1.body.user.id;

        const groupRepository = new DrizzleGroupRepository();
        const group = await groupRepository.createGroup("Test Group", userId1);
        const groupId = group.id;

        const mapRepository = new DrizzleMapRepository();
        const map = await mapRepository.createMap(groupId, {
            name: "Test Map",
        });
        const mapId = map.id;

        const category = await mapRepository.createCategory(mapId, {
            description: "Original",
            color: "#FF0000",
        });
        const categoryId = category.id;

        await request(app)
            .put(`/${groupId}/maps/${mapId}/categories/${categoryId}`)
            .set("Authorization", `Bearer ${accessToken2}`)
            .send({ description: "Updated", color: "#00FF00" })
            .expect(403);
    });

    it("PUT /:groupId/maps/:mapId/categories/:categoryId should return 404 for non-existent category", async () => {
        const app = getTestApp();

        const uniqueUser = {
            name: "UpdateCategory",
            surname: "TestUser",
            email: `update-category-test-${Date.now()}${Math.random()}@example.com`,
            password: "testpass123",
        };

        await request(app).post("/users").send(uniqueUser);

        const loginResponse = await request(app).post("/users/login").send({
            email: uniqueUser.email,
            password: uniqueUser.password,
        });

        const accessToken = loginResponse.body.token;
        const userId = loginResponse.body.user.id;

        const groupRepository = new DrizzleGroupRepository();
        const group = await groupRepository.createGroup("Test Group", userId);
        const groupId = group.id;

        const mapRepository = new DrizzleMapRepository();
        const map = await mapRepository.createMap(groupId, {
            name: "Test Map",
        });
        const mapId = map.id;

        const nonExistentCategoryId = "00000000-0000-0000-0000-000000000000";

        await request(app)
            .put(`/${groupId}/maps/${mapId}/categories/${nonExistentCategoryId}`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ description: "Updated", color: "#00FF00" })
            .expect(404);
    });

    it("PUT /:groupId/maps/:mapId/categories/:categoryId should return 403 for wrong map", async () => {
        const app = getTestApp();

        const uniqueUser = {
            name: "UpdateCategory",
            surname: "TestUser",
            email: `update-category-test-${Date.now()}${Math.random()}@example.com`,
            password: "testpass123",
        };

        await request(app).post("/users").send(uniqueUser);

        const loginResponse = await request(app).post("/users/login").send({
            email: uniqueUser.email,
            password: uniqueUser.password,
        });

        const accessToken = loginResponse.body.token;
        const userId = loginResponse.body.user.id;

        const groupRepository = new DrizzleGroupRepository();
        const group = await groupRepository.createGroup("Test Group", userId);
        const groupId = group.id;

        const mapRepository = new DrizzleMapRepository();
        const map1 = await mapRepository.createMap(groupId, {
            name: "Test Map 1",
        });
        const map2 = await mapRepository.createMap(groupId, {
            name: "Test Map 2",
        });

        const category = await mapRepository.createCategory(map1.id, {
            description: "Original",
            color: "#FF0000",
        });

        await request(app)
            .put(`/${groupId}/maps/${map2.id}/categories/${category.id}`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ description: "Updated", color: "#00FF00" })
            .expect(404);
    });
});