import request from "supertest";
import { DrizzleGroupRepository } from "../../src/dependency-implementations/DrizzleGroupRepository";
import { DrizzleMapRepository } from "../../src/dependency-implementations/DrizzleMapRepository";

import { getTestApp } from "./setup";

describe("Get Public Map Categories Route", () => {
    it("GET /public/maps/:publicMapId/categories should return categories", async () => {
        const app = getTestApp();

        const uniqueUser = {
            name: "PublicMapCategories",
            surname: "TestUser",
            email: `public-map-categories-${Date.now()}${Math.random()}@example.com`,
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
            "Test Public Categories Group",
            userId,
        );
        const map = await mapRepository.createMap(group.id, {
            name: "Public Categories Test Map",
        });

        const updatedMap = await mapRepository.updateMap(map.id, group.id, {
            isPublic: true,
        });

        await request(app)
            .post(`/${group.id}/maps/${map.id}/categories`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({
                description: "Test Category",
                color: "#FF0000",
            });

        const response = await request(app)
            .get(`/public/maps/${updatedMap!.publicId}/categories`)
            .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
        expect(response.body[0]).toHaveProperty("description");
        expect(response.body[0]).toHaveProperty("color");
    });

    it("GET /public/maps/:publicMapId/categories should return 404 for non-existent publicId", async () => {
        const app = getTestApp();

        const response = await request(app)
            .get("/public/maps/00000000-0000-0000-0000-000000000000/categories")
            .expect(404);

        expect(response.body).toHaveProperty("error");
    });

    it("GET /public/maps/:publicMapId/categories should be accessible without authentication", async () => {
        const app = getTestApp();

        const uniqueUser = {
            name: "PublicMapCategories",
            surname: "NoAuth",
            email: `public-map-categories-noauth-${Date.now()}${Math.random()}@example.com`,
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
            "Test Public Categories No Auth",
            userId,
        );
        const map = await mapRepository.createMap(group.id, {
            name: "Public Categories No Auth Map",
        });

        const updatedMap = await mapRepository.updateMap(map.id, group.id, {
            isPublic: true,
        });

        const response = await request(app)
            .get(`/public/maps/${updatedMap!.publicId}/categories`)
            .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
    });

    it("GET /public/maps/:publicMapId/categories should return empty array when no categories exist", async () => {
        const app = getTestApp();

        const uniqueUser = {
            name: "PublicMapCategories",
            surname: "Empty",
            email: `public-map-categories-empty-${Date.now()}${Math.random()}@example.com`,
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
            "Test Public Empty Categories",
            userId,
        );
        const map = await mapRepository.createMap(group.id, {
            name: "Public Empty Categories Map",
        });

        const updatedMap = await mapRepository.updateMap(map.id, group.id, {
            isPublic: true,
        });

        const response = await request(app)
            .get(`/public/maps/${updatedMap!.publicId}/categories`)
            .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBe(0);
    });
});
