import request from "supertest";

import { DrizzleGroupRepository } from "../../src/dependency-implementations/DrizzleGroupRepository";
import { getTestApp } from "./setup";
import { testMapPoint } from "./helpers";

describe("Get Map Points Route", () => {
    let app: any;
    let accessToken: string;
    let groupId: string;
    let mapId: string;

    beforeAll(async () => {
        app = getTestApp();

        const uniqueUser = {
            name: "MapPoints",
            surname: "TestUser",
            email: `mappoints-test-${Date.now()}@example.com`,
            password: "testpass123",
        };

        await request(app).post("/users").send(uniqueUser);

        const loginResponse = await request(app).post("/users/login").send({
            email: uniqueUser.email,
            password: uniqueUser.password,
        });

        accessToken = loginResponse.body.token;
        const userId = loginResponse.body.user.id;

        const groupRepository = new DrizzleGroupRepository();
        const group = await groupRepository.createGroup("Test Group", userId);
        groupId = group.id;

        const mapResponse = await request(app)
            .post(`/${groupId}/maps`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ name: "Test Map" });

        mapId = mapResponse.body.id;
    });

    it("GET /:groupId/maps/:mapId/points should return empty array initially", async () => {
        const response = await request(app)
            .get(`/${groupId}/maps/${mapId}/points`)
            .set("Authorization", `Bearer ${accessToken}`)
            .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
    });

    it("GET /:groupId/maps/:mapId/points should return created map points", async () => {
        await request(app)
            .post(`/${groupId}/maps/${mapId}/points`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send(testMapPoint);

        const response = await request(app)
            .get(`/${groupId}/maps/${mapId}/points`)
            .set("Authorization", `Bearer ${accessToken}`)
            .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
    });

    it("GET /:groupId/maps/:mapId/points should return 401 without token", async () => {
        const response = await request(app)
            .get(`/${groupId}/maps/${mapId}/points`)
            .expect(401);
        expect(response.body).toHaveProperty("error");
    });

    it("GET /:groupId/maps/:mapId/points should return 401 with invalid token", async () => {
        const response = await request(app)
            .get(`/${groupId}/maps/${mapId}/points`)
            .set("Authorization", "Bearer invalid-token")
            .expect(401);
        expect(response.body).toHaveProperty("error");
    });
});
