import request from "supertest";

import { DrizzleGroupRepository } from "../../src/dependency-implementations/DrizzleGroupRepository";
import { DrizzleMapRepository } from "../../src/dependency-implementations/DrizzleMapRepository";
import { getTestApp } from "./setup";

describe("Get Map Categories Route", () => {
    it("GET /:groupId/maps/:mapId/categories should return all categories", async () => {
        const app = getTestApp();

        const uniqueUser = {
            name: "GetCategories",
            surname: "TestUser",
            email: `get-categories-test-${Date.now()}${Math.random()}@example.com`,
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

        await mapRepository.createCategory(mapId, {
            description: "Furto",
            color: "#FF0000",
        });

        await mapRepository.createCategory(mapId, {
            description: "Rapina",
            color: "#00FF00",
        });

        const response = await request(app)
            .get(`/${groupId}/maps/${mapId}/categories`)
            .set("Authorization", `Bearer ${accessToken}`)
            .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body).toHaveLength(2);
        expect(response.body[0]).toHaveProperty("id");
        expect(response.body[0]).toHaveProperty("description");
        expect(response.body[0]).toHaveProperty("color");
        expect(response.body[0].description).toBe("Furto");
        expect(response.body[1].description).toBe("Rapina");
    });

    it("GET /:groupId/maps/:mapId/categories should return empty array when no categories exist", async () => {
        const app = getTestApp();

        const uniqueUser = {
            name: "GetCategories",
            surname: "TestUser",
            email: `get-categories-test-${Date.now()}${Math.random()}@example.com`,
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

        const response = await request(app)
            .get(`/${groupId}/maps/${mapId}/categories`)
            .set("Authorization", `Bearer ${accessToken}`)
            .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body).toHaveLength(0);
    });

    it("GET /:groupId/maps/:mapId/categories should return 401 without token", async () => {
        const app = getTestApp();

        const uniqueUser = {
            name: "GetCategories",
            surname: "TestUser",
            email: `get-categories-test-${Date.now()}${Math.random()}@example.com`,
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

        await request(app)
            .get(`/${groupId}/maps/${mapId}/categories`)
            .expect(401);
    });

    it("GET /:groupId/maps/:mapId/categories should return 403 when user cannot access group", async () => {
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

        await request(app)
            .get(`/${groupId}/maps/${mapId}/categories`)
            .set("Authorization", `Bearer ${accessToken2}`)
            .expect(403);
    });
});
