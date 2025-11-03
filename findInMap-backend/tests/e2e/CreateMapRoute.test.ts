import request from "supertest";

import { DrizzleGroupRepository } from "../../src/dependency-implementations/DrizzleGroupRepository";
import { getTestApp } from "./setup";

describe("Create Map Route", () => {
    it("POST /:groupId/maps should create a map in a group", async () => {
        const app = getTestApp();

        const uniqueUser = {
            name: "CreateMaps",
            surname: "TestUser",
            email: `create-maps-test-${Date.now()}${Math.random()}@example.com`,
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

        const response = await request(app)
            .post(`/${groupId}/maps`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ name: "Test Map" })
            .expect(201);

        expect(response.body).toHaveProperty("id");
        expect(typeof response.body.id).toBe("string");
        expect(response.body.name).toBe("Test Map");
    });

    it("POST /:groupId/maps should return correct map structure", async () => {
        const app = getTestApp();

        const uniqueUser = {
            name: "CreateMaps",
            surname: "TestUser",
            email: `create-maps-test-${Date.now()}${Math.random()}@example.com`,
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

        const response = await request(app)
            .post(`/${groupId}/maps`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ name: "Another Test Map" })
            .expect(201);

        expect(response.body).toHaveProperty("id");
        expect(response.body).toHaveProperty("name");
        expect(typeof response.body.id).toBe("string");
        expect(typeof response.body.name).toBe("string");
        expect(response.body.name).toBe("Another Test Map");
    });

    it("POST /:groupId/maps should return 401 without token", async () => {
        const app = getTestApp();

        const uniqueUser = {
            name: "CreateMaps",
            surname: "TestUser",
            email: `create-maps-test-${Date.now()}${Math.random()}@example.com`,
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

        const response = await request(app)
            .post(`/${groupId}/maps`)
            .send({ name: "Unauthorized Map" })
            .expect(401);
        expect(response.body).toHaveProperty("error");
    });

    it("POST /:groupId/maps should return 403 when user tries to create map in another user's group", async () => {
        const app = getTestApp();

        const uniqueUser = {
            name: "CreateMaps",
            surname: "TestUser",
            email: `create-maps-test-${Date.now()}${Math.random()}@example.com`,
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

        const anotherUser = {
            name: "Another",
            surname: "User",
            email: `another-create-maps-test-${Date.now()}@example.com`,
            password: "testpass123",
        };

        await request(app).post("/users").send(anotherUser);

        const anotherLoginResponse = await request(app)
            .post("/users/login")
            .send({
                email: anotherUser.email,
                password: anotherUser.password,
            });

        const anotherAccessToken = anotherLoginResponse.body.token;

        const response = await request(app)
            .post(`/${groupId}/maps`)
            .set("Authorization", `Bearer ${anotherAccessToken}`)
            .send({ name: "Forbidden Map" })
            .expect(403);

        expect(response.body).toHaveProperty("error");
    });
});
