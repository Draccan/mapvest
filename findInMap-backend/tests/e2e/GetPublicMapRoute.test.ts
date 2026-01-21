import request from "supertest";
import { DrizzleGroupRepository } from "../../src/dependency-implementations/DrizzleGroupRepository";
import { DrizzleMapRepository } from "../../src/dependency-implementations/DrizzleMapRepository";

import { getTestApp } from "./setup";

describe("Get Public Map Route", () => {
    it("GET /public/maps/:publicMapId should return public map data", async () => {
        const app = getTestApp();

        const uniqueUser = {
            name: "PublicMap",
            surname: "TestUser",
            email: `public-map-test-${Date.now()}${Math.random()}@example.com`,
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
            "Test Public Group",
            userId,
        );
        const map = await mapRepository.createMap(group.id, {
            name: "Public Test Map",
        });

        const updatedMap = await mapRepository.updateMap(map.id, group.id, {
            isPublic: true,
        });

        const response = await request(app)
            .get(`/public/maps/${updatedMap!.publicId}`)
            .expect(200);

        expect(response.body).toHaveProperty("name", "Public Test Map");
        expect(response.body).toHaveProperty("publicId", updatedMap!.publicId);
    });

    it("GET /public/maps/:publicMapId should return 404 for non-existent publicId", async () => {
        const app = getTestApp();

        const response = await request(app)
            .get("/public/maps/00000000-0000-0000-0000-000000000000")
            .expect(404);

        expect(response.body).toHaveProperty("error");
    });

    it("GET /public/maps/:publicMapId should be accessible without authentication", async () => {
        const app = getTestApp();

        const uniqueUser = {
            name: "PublicMap",
            surname: "TestUser",
            email: `public-map-noauth-${Date.now()}${Math.random()}@example.com`,
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
            "Test Public Group No Auth",
            userId,
        );
        const map = await mapRepository.createMap(group.id, {
            name: "Public Map No Auth",
        });

        const updatedMap = await mapRepository.updateMap(map.id, group.id, {
            isPublic: true,
        });

        const response = await request(app)
            .get(`/public/maps/${updatedMap!.publicId}`)
            .expect(200);

        expect(response.body).toHaveProperty("name", "Public Map No Auth");
        expect(response.body).toHaveProperty("publicId", updatedMap!.publicId);
    });

    it("GET /public/maps/:publicMapId should only return name and publicId", async () => {
        const app = getTestApp();

        const uniqueUser = {
            name: "PublicMap",
            surname: "TestUser",
            email: `public-map-fields-${Date.now()}${Math.random()}@example.com`,
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
            "Test Public Group Fields",
            userId,
        );
        const map = await mapRepository.createMap(group.id, {
            name: "Public Map Fields Test",
        });

        const updatedMap = await mapRepository.updateMap(map.id, group.id, {
            isPublic: true,
        });

        const response = await request(app)
            .get(`/public/maps/${updatedMap!.publicId}`)
            .expect(200);

        expect(Object.keys(response.body).sort()).toEqual(
            ["name", "publicId"].sort(),
        );
    });
});
