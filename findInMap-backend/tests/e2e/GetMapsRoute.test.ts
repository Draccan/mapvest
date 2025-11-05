import request from "supertest";
import { DrizzleGroupRepository } from "../../src/dependency-implementations/DrizzleGroupRepository";

import { getTestApp } from "./setup";

describe("Get Maps Route", () => {
    it("GET /:groupId/maps should return maps for a group", async () => {
        const app = getTestApp();

        const uniqueUser = {
            name: "Maps",
            surname: "TestUser",
            email: `maps-test-${Date.now()}${Math.random()}@example.com`,
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
            .get(`/${groupId}/maps`)
            .set("Authorization", `Bearer ${accessToken}`)
            .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
    });

    it("GET /:groupId/maps should return 401 without token", async () => {
        const app = getTestApp();

        const uniqueUser = {
            name: "Maps",
            surname: "TestUser",
            email: `maps-test-${Date.now()}${Math.random()}@example.com`,
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

        const response = await request(app).get(`/${groupId}/maps`).expect(401);
        expect(response.body).toHaveProperty("error");
    });

    it("GET /:groupId/maps should return 403 when user tries to access another user's group", async () => {
        const app = getTestApp();

        const uniqueUser = {
            name: "Maps",
            surname: "TestUser",
            email: `maps-test-${Date.now()}${Math.random()}@example.com`,
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

        const anotherUser = {
            name: "Another",
            surname: "User",
            email: `another-maps-test-${Date.now()}${Math.random()}@example.com`,
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
            .get(`/${groupId}/maps`)
            .set("Authorization", `Bearer ${anotherAccessToken}`)
            .expect(403);

        expect(response.body).toHaveProperty("error");
    });
});
