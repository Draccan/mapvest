import request from "supertest";

import { UserGroupRole } from "../../src/core/commons/enums";
import { DrizzleGroupRepository } from "../../src/dependency-implementations/DrizzleGroupRepository";
import { getTestApp } from "./setup";

describe("DeleteMapRoute", () => {
    let app: any;
    let accessToken: string;
    let groupId: string;
    let mapId: string;
    let userId: string;

    beforeAll(async () => {
        app = getTestApp();

        const uniqueUser = {
            name: "DeleteMap",
            surname: "TestUser",
            email: `delete-map-test-${Date.now()}@example.com`,
            password: "testpass123",
        };

        await request(app).post("/users").send(uniqueUser);

        const loginResponse = await request(app).post("/users/login").send({
            email: uniqueUser.email,
            password: uniqueUser.password,
        });

        accessToken = loginResponse.body.token;
        userId = loginResponse.body.user.id;

        const groupRepository = new DrizzleGroupRepository();
        const group = await groupRepository.createGroup("Test Group", userId);
        groupId = group.id;

        const mapResponse = await request(app)
            .post(`/${groupId}/maps`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ name: "Map to Delete" });

        mapId = mapResponse.body.id;
    });

    it("DELETE /:groupId/maps/:mapId should successfully delete a map", async () => {
        const newMapResponse = await request(app)
            .post(`/${groupId}/maps`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ name: "Map to Delete Test" });

        const newMapId = newMapResponse.body.id;

        await request(app)
            .post(`/${groupId}/maps/${newMapId}/points`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({
                long: 12.4964,
                lat: 41.9028,
                description: "Test Point",
                date: "2024-01-01",
            });

        await request(app)
            .post(`/${groupId}/maps/${newMapId}/categories`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({
                description: "Test Category",
                color: "#FF0000",
            });

        await request(app)
            .delete(`/${groupId}/maps/${newMapId}`)
            .set("Authorization", `Bearer ${accessToken}`)
            .expect(204);

        const mapsResponse = await request(app)
            .get(`/${groupId}/maps`)
            .set("Authorization", `Bearer ${accessToken}`)
            .expect(200);

        const mapIds = mapsResponse.body.map((m: any) => m.id);
        expect(mapIds).not.toContain(newMapId);
    });

    it("DELETE /:groupId/maps/:mapId should return 403 when user has no access to group", async () => {
        const otherUser = {
            name: "Other",
            surname: "User",
            email: `other-user-delete-map-${Date.now()}@example.com`,
            password: "testpass123",
        };

        await request(app).post("/users").send(otherUser);

        const otherLoginResponse = await request(app)
            .post("/users/login")
            .send({
                email: otherUser.email,
                password: otherUser.password,
            });

        const otherAccessToken = otherLoginResponse.body.token;

        const response = await request(app)
            .delete(`/${groupId}/maps/${mapId}`)
            .set("Authorization", `Bearer ${otherAccessToken}`)
            .expect(403);

        expect(response.body).toHaveProperty("error");
    });

    it("DELETE /:groupId/maps/:mapId should return 403 when map does not belong to group", async () => {
        const otherUser = {
            name: "Other",
            surname: "User",
            email: `other-user-delete-map2-${Date.now()}@example.com`,
            password: "testpass123",
        };

        await request(app).post("/users").send(otherUser);

        const otherLoginResponse = await request(app)
            .post("/users/login")
            .send({
                email: otherUser.email,
                password: otherUser.password,
            });

        const otherAccessToken = otherLoginResponse.body.token;
        const otherUserId = otherLoginResponse.body.user.id;

        const groupRepository = new DrizzleGroupRepository();
        const otherGroup = await groupRepository.createGroup(
            "Other Group",
            otherUserId,
        );

        const response = await request(app)
            .delete(`/${otherGroup.id}/maps/${mapId}`)
            .set("Authorization", `Bearer ${otherAccessToken}`)
            .expect(403);

        expect(response.body).toHaveProperty("error");
    });

    it("DELETE /:groupId/maps/:mapId should return 403 when user is contributor", async () => {
        const contributorUser = {
            name: "Contributor",
            surname: "User",
            email: `contributor-delete-map-${Date.now()}@example.com`,
            password: "testpass123",
        };

        await request(app).post("/users").send(contributorUser);

        const contributorLoginResponse = await request(app)
            .post("/users/login")
            .send({
                email: contributorUser.email,
                password: contributorUser.password,
            });

        const contributorAccessToken = contributorLoginResponse.body.token;
        const contributorUserId = contributorLoginResponse.body.user.id;

        const groupRepository = new DrizzleGroupRepository();
        await groupRepository.addUserToGroup(
            contributorUserId,
            groupId,
            UserGroupRole.Contributor,
        );

        const newMapResponse = await request(app)
            .post(`/${groupId}/maps`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ name: "Map for Contributor Test" });

        const newMapId = newMapResponse.body.id;

        const response = await request(app)
            .delete(`/${groupId}/maps/${newMapId}`)
            .set("Authorization", `Bearer ${contributorAccessToken}`)
            .expect(403);

        expect(response.body).toHaveProperty("error");

        const mapsResponse = await request(app)
            .get(`/${groupId}/maps`)
            .set("Authorization", `Bearer ${accessToken}`)
            .expect(200);

        const mapIds = mapsResponse.body.map((m: any) => m.id);
        expect(mapIds).toContain(newMapId);
    });

    it("DELETE /:groupId/maps/:mapId should allow admin to delete map", async () => {
        const adminUser = {
            name: "Admin",
            surname: "User",
            email: `admin-delete-map-${Date.now()}@example.com`,
            password: "testpass123",
        };

        await request(app).post("/users").send(adminUser);

        const adminLoginResponse = await request(app)
            .post("/users/login")
            .send({
                email: adminUser.email,
                password: adminUser.password,
            });

        const adminAccessToken = adminLoginResponse.body.token;
        const adminUserId = adminLoginResponse.body.user.id;

        const groupRepository = new DrizzleGroupRepository();
        await groupRepository.addUserToGroup(
            adminUserId,
            groupId,
            UserGroupRole.Admin,
        );

        const newMapResponse = await request(app)
            .post(`/${groupId}/maps`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ name: "Map for Admin Delete Test" });

        const newMapId = newMapResponse.body.id;

        await request(app)
            .delete(`/${groupId}/maps/${newMapId}`)
            .set("Authorization", `Bearer ${adminAccessToken}`)
            .expect(204);

        const mapsResponse = await request(app)
            .get(`/${groupId}/maps`)
            .set("Authorization", `Bearer ${accessToken}`)
            .expect(200);

        const mapIds = mapsResponse.body.map((m: any) => m.id);
        expect(mapIds).not.toContain(newMapId);
    });

    it("DELETE /:groupId/maps/:mapId should return 401 without token", async () => {
        const response = await request(app)
            .delete(`/${groupId}/maps/${mapId}`)
            .expect(401);

        expect(response.body).toHaveProperty("error");
    });

    it("DELETE /:groupId/maps/:mapId should return 401 with invalid token", async () => {
        const response = await request(app)
            .delete(`/${groupId}/maps/${mapId}`)
            .set("Authorization", "Bearer invalid-token")
            .expect(401);

        expect(response.body).toHaveProperty("error");
    });

    it("DELETE /:groupId/maps/:mapId should delete map with all associated points and categories", async () => {
        const newMapResponse = await request(app)
            .post(`/${groupId}/maps`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ name: "Map with Data" });

        const newMapId = newMapResponse.body.id;

        await request(app)
            .post(`/${groupId}/maps/${newMapId}/points`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({
                long: 12.4964,
                lat: 41.9028,
                description: "Point 1",
                date: "2024-01-01",
            });

        await request(app)
            .post(`/${groupId}/maps/${newMapId}/points`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({
                long: 13.4964,
                lat: 42.9028,
                description: "Point 2",
                date: "2024-01-02",
            });

        await request(app)
            .post(`/${groupId}/maps/${newMapId}/categories`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({
                description: "Category 1",
                color: "#FF0000",
            });

        await request(app)
            .post(`/${groupId}/maps/${newMapId}/categories`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({
                description: "Category 2",
                color: "#00FF00",
            });

        const pointsBefore = await request(app)
            .get(`/${groupId}/maps/${newMapId}/points`)
            .set("Authorization", `Bearer ${accessToken}`)
            .expect(200);

        expect(pointsBefore.body.length).toBe(2);

        const categoriesBefore = await request(app)
            .get(`/${groupId}/maps/${newMapId}/categories`)
            .set("Authorization", `Bearer ${accessToken}`)
            .expect(200);

        expect(categoriesBefore.body.length).toBe(2);

        await request(app)
            .delete(`/${groupId}/maps/${newMapId}`)
            .set("Authorization", `Bearer ${accessToken}`)
            .expect(204);

        const mapsResponse = await request(app)
            .get(`/${groupId}/maps`)
            .set("Authorization", `Bearer ${accessToken}`)
            .expect(200);

        const mapIds = mapsResponse.body.map((m: any) => m.id);
        expect(mapIds).not.toContain(newMapId);
    });

    it("DELETE /:groupId/maps/:mapId should not affect other maps in the same group", async () => {
        const map1Response = await request(app)
            .post(`/${groupId}/maps`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ name: "Map 1" });

        const map1Id = map1Response.body.id;

        const map2Response = await request(app)
            .post(`/${groupId}/maps`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ name: "Map 2" });

        const map2Id = map2Response.body.id;

        await request(app)
            .post(`/${groupId}/maps/${map1Id}/points`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({
                long: 12.4964,
                lat: 41.9028,
                description: "Point for Map 1",
                date: "2024-01-01",
            });

        await request(app)
            .post(`/${groupId}/maps/${map2Id}/points`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({
                long: 13.4964,
                lat: 42.9028,
                description: "Point for Map 2",
                date: "2024-01-02",
            });

        await request(app)
            .delete(`/${groupId}/maps/${map1Id}`)
            .set("Authorization", `Bearer ${accessToken}`)
            .expect(204);

        const mapsResponse = await request(app)
            .get(`/${groupId}/maps`)
            .set("Authorization", `Bearer ${accessToken}`)
            .expect(200);

        const mapIds = mapsResponse.body.map((m: any) => m.id);
        expect(mapIds).not.toContain(map1Id);
        expect(mapIds).toContain(map2Id);

        const map2Points = await request(app)
            .get(`/${groupId}/maps/${map2Id}/points`)
            .set("Authorization", `Bearer ${accessToken}`)
            .expect(200);

        expect(map2Points.body.length).toBe(1);
        expect(map2Points.body[0].description).toBe("Point for Map 2");
    });
});