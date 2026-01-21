import request from "supertest";
import { DrizzleGroupRepository } from "../../src/dependency-implementations/DrizzleGroupRepository";
import { DrizzleMapRepository } from "../../src/dependency-implementations/DrizzleMapRepository";

import { getTestApp } from "./setup";

describe("Get Public Map Points Route", () => {
    it("GET /public/maps/:publicMapId/points should return map points", async () => {
        const app = getTestApp();

        const uniqueUser = {
            name: "PublicMapPoints",
            surname: "TestUser",
            email: `public-map-points-${Date.now()}${Math.random()}@example.com`,
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
        const mapRepository = new DrizzleMapRepository();

        const group = await groupRepository.createGroup(
            "Test Public Points Group",
            userId,
        );
        const map = await mapRepository.createMap(group.id, {
            name: "Public Points Test Map",
        });

        const updatedMap = await mapRepository.updateMap(map.id, group.id, {
            isPublic: true,
        });

        await request(app)
            .post(`/${group.id}/maps/${map.id}/points`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({
                long: 45.4642,
                lat: 9.19,
                description: "Test Point",
                date: "2025-12-03",
            });

        const response = await request(app)
            .get(`/public/maps/${updatedMap!.publicId}/points`)
            .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
        expect(response.body[0]).toHaveProperty("long");
        expect(response.body[0]).toHaveProperty("lat");
        expect(response.body[0]).toHaveProperty("date");
    });

    it("GET /public/maps/:publicMapId/points should return 404 for non-existent publicId", async () => {
        const app = getTestApp();

        const response = await request(app)
            .get("/public/maps/00000000-0000-0000-0000-000000000000/points")
            .expect(404);

        expect(response.body).toHaveProperty("error");
    });

    it("GET /public/maps/:publicMapId/points should be accessible without authentication", async () => {
        const app = getTestApp();

        const uniqueUser = {
            name: "PublicMapPoints",
            surname: "NoAuth",
            email: `public-map-points-noauth-${Date.now()}${Math.random()}@example.com`,
            password: "testpass123",
        };

        await request(app).post("/users").send(uniqueUser);

        const loginResponse = await request(app).post("/users/login").send({
            email: uniqueUser.email,
            password: uniqueUser.password,
        });

        const userId = loginResponse.body.user.id;

        const groupRepository = new DrizzleGroupRepository();
        const mapRepository = new DrizzleMapRepository();

        const group = await groupRepository.createGroup(
            "Test Public Points No Auth",
            userId,
        );
        const map = await mapRepository.createMap(group.id, {
            name: "Public Points No Auth Map",
        });

        const updatedMap = await mapRepository.updateMap(map.id, group.id, {
            isPublic: true,
        });

        const response = await request(app)
            .get(`/public/maps/${updatedMap!.publicId}/points`)
            .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
    });

    it("GET /public/maps/:publicMapId/points should return empty array when no points exist", async () => {
        const app = getTestApp();

        const uniqueUser = {
            name: "PublicMapPoints",
            surname: "Empty",
            email: `public-map-points-empty-${Date.now()}${Math.random()}@example.com`,
            password: "testpass123",
        };

        await request(app).post("/users").send(uniqueUser);

        const loginResponse = await request(app).post("/users/login").send({
            email: uniqueUser.email,
            password: uniqueUser.password,
        });

        const userId = loginResponse.body.user.id;

        const groupRepository = new DrizzleGroupRepository();
        const mapRepository = new DrizzleMapRepository();

        const group = await groupRepository.createGroup(
            "Test Public Empty Points",
            userId,
        );
        const map = await mapRepository.createMap(group.id, {
            name: "Public Empty Points Map",
        });

        const updatedMap = await mapRepository.updateMap(map.id, group.id, {
            isPublic: true,
        });

        const response = await request(app)
            .get(`/public/maps/${updatedMap!.publicId}/points`)
            .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBe(0);
    });
});
