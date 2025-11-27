import request from "supertest";

import { DrizzleGroupRepository } from "../../src/dependency-implementations/DrizzleGroupRepository";
import { DrizzleMapRepository } from "../../src/dependency-implementations/DrizzleMapRepository";
import { getTestApp } from "./setup";

describe("Create Map Category Route", () => {
    it("POST /:groupId/maps/:mapId/categories should create a category", async () => {
        const app = getTestApp();

        const uniqueUser = {
            name: "CreateCategories",
            surname: "TestUser",
            email: `create-categories-test-${Date.now()}${Math.random()}@example.com`,
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
            .post(`/${groupId}/maps/${mapId}/categories`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ description: "Furto", color: "#FF0000" })
            .expect(201);

        expect(response.body).toHaveProperty("id");
        expect(typeof response.body.id).toBe("string");
        expect(response.body.description).toBe("Furto");
        expect(response.body.color).toBe("#FF0000");
    });

    it("POST /:groupId/maps/:mapId/categories should return correct category structure", async () => {
        const app = getTestApp();

        const uniqueUser = {
            name: "CreateCategories",
            surname: "TestUser",
            email: `create-categories-test-${Date.now()}${Math.random()}@example.com`,
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
            .post(`/${groupId}/maps/${mapId}/categories`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ description: "Rapina", color: "#00FF00" })
            .expect(201);

        expect(response.body).toHaveProperty("id");
        expect(response.body).toHaveProperty("description");
        expect(response.body).toHaveProperty("color");
        expect(typeof response.body.id).toBe("string");
        expect(typeof response.body.description).toBe("string");
        expect(typeof response.body.color).toBe("string");
        expect(response.body.description).toBe("Rapina");
        expect(response.body.color).toBe("#00FF00");
    });

    it("POST /:groupId/maps/:mapId/categories should return 401 without token", async () => {
        const app = getTestApp();

        const uniqueUser = {
            name: "CreateCategories",
            surname: "TestUser",
            email: `create-categories-test-${Date.now()}${Math.random()}@example.com`,
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
            .post(`/${groupId}/maps/${mapId}/categories`)
            .send({ description: "Furto", color: "#FF0000" })
            .expect(401);
    });

    it("POST /:groupId/maps/:mapId/categories should return 403 when user cannot access group", async () => {
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
            .post(`/${groupId}/maps/${mapId}/categories`)
            .set("Authorization", `Bearer ${accessToken2}`)
            .send({ description: "Furto", color: "#FF0000" })
            .expect(403);
    });
});
