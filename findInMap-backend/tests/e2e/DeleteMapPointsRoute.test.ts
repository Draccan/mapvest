import request from "supertest";

import { DrizzleGroupRepository } from "../../src/dependency-implementations/DrizzleGroupRepository";
import { DrizzleMapRepository } from "../../src/dependency-implementations/DrizzleMapRepository";
import { getTestApp } from "./setup";
import { testMapPoint } from "./helpers";

describe("Delete Map Points Route", () => {
    let app: any;
    let accessToken: string;
    let groupId: string;
    let mapId: string;
    let otherGroupId: string;
    let otherMapId: string;
    let otherUserAccessToken: string;

    beforeAll(async () => {
        app = getTestApp();

        const uniqueUser = {
            name: "DeleteMapPoints",
            surname: "TestUser",
            email: `delete-mappoints-test-${Date.now()}@example.com`,
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

        const otherUser = {
            name: "Other",
            surname: "User",
            email: `other-user-${Date.now()}@example.com`,
            password: "testpass123",
        };

        await request(app).post("/users").send(otherUser);

        const otherLoginResponse = await request(app)
            .post("/users/login")
            .send({
                email: otherUser.email,
                password: otherUser.password,
            });

        otherUserAccessToken = otherLoginResponse.body.token;
        const otherUserId = otherLoginResponse.body.user.id;

        const otherGroup = await groupRepository.createGroup(
            "Other Group",
            otherUserId,
        );
        otherGroupId = otherGroup.id;

        const otherMapResponse = await request(app)
            .post(`/${otherGroupId}/maps`)
            .set("Authorization", `Bearer ${otherUserAccessToken}`)
            .send({ name: "Other Map" });

        otherMapId = otherMapResponse.body.id;
    });

    it("DELETE /:groupId/maps/:mapId/points should successfully delete map points", async () => {
        // Create multiple map points
        const point1Response = await request(app)
            .post(`/${groupId}/maps/${mapId}/points`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send(testMapPoint);

        const point2Response = await request(app)
            .post(`/${groupId}/maps/${mapId}/points`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ ...testMapPoint, lat: 10.0 });

        const point3Response = await request(app)
            .post(`/${groupId}/maps/${mapId}/points`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ ...testMapPoint, lat: 11.0 });

        const pointId1 = String(point1Response.body.id);
        const pointId2 = String(point2Response.body.id);
        const pointId3 = String(point3Response.body.id);

        const beforeDeleteResponse = await request(app)
            .get(`/${groupId}/maps/${mapId}/points`)
            .set("Authorization", `Bearer ${accessToken}`)
            .expect(200);

        const initialPointCount = beforeDeleteResponse.body.length;
        expect(initialPointCount).toBeGreaterThanOrEqual(3);

        await request(app)
            .delete(`/${groupId}/maps/${mapId}/points`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ pointIds: [pointId1, pointId2] })
            .expect(204);

        const afterDeleteResponse = await request(app)
            .get(`/${groupId}/maps/${mapId}/points`)
            .set("Authorization", `Bearer ${accessToken}`)
            .expect(200);

        expect(afterDeleteResponse.body.length).toBe(initialPointCount - 2);
        const remainingIds = afterDeleteResponse.body.map((point: any) =>
            String(point.id),
        );
        expect(remainingIds).not.toContain(pointId1);
        expect(remainingIds).not.toContain(pointId2);
        expect(remainingIds).toContain(pointId3);
    });

    it("DELETE /:groupId/maps/:mapId/points should not delete points from other maps", async () => {
        const point1Response = await request(app)
            .post(`/${groupId}/maps/${mapId}/points`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send(testMapPoint);

        const pointId1 = String(point1Response.body.id);

        const point2Response = await request(app)
            .post(`/${otherGroupId}/maps/${otherMapId}/points`)
            .set("Authorization", `Bearer ${otherUserAccessToken}`)
            .send(testMapPoint);

        const pointId2 = String(point2Response.body.id);

        const beforeResponse = await request(app)
            .get(`/${otherGroupId}/maps/${otherMapId}/points`)
            .set("Authorization", `Bearer ${otherUserAccessToken}`)
            .expect(200);

        const otherMapPointCount = beforeResponse.body.length;

        await request(app)
            .delete(`/${groupId}/maps/${mapId}/points`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ pointIds: [pointId1, pointId2] })
            .expect(204);

        const afterFirstMapResponse = await request(app)
            .get(`/${groupId}/maps/${mapId}/points`)
            .set("Authorization", `Bearer ${accessToken}`)
            .expect(200);

        const firstMapIds = afterFirstMapResponse.body.map((point: any) =>
            String(point.id),
        );
        expect(firstMapIds).not.toContain(pointId1);

        const afterOtherMapResponse = await request(app)
            .get(`/${otherGroupId}/maps/${otherMapId}/points`)
            .set("Authorization", `Bearer ${otherUserAccessToken}`)
            .expect(200);

        expect(afterOtherMapResponse.body.length).toBe(otherMapPointCount);
        const otherMapIds = afterOtherMapResponse.body.map((point: any) =>
            String(point.id),
        );
        expect(otherMapIds).toContain(pointId2);
    });

    it("DELETE /:groupId/maps/:mapId/points should return 403 when user has no access to group", async () => {
        const pointResponse = await request(app)
            .post(`/${otherGroupId}/maps/${otherMapId}/points`)
            .set("Authorization", `Bearer ${otherUserAccessToken}`)
            .send(testMapPoint);

        const pointId = String(pointResponse.body.id);

        const response = await request(app)
            .delete(`/${otherGroupId}/maps/${otherMapId}/points`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ pointIds: [pointId] })
            .expect(403);

        expect(response.body).toHaveProperty("error");

        const verifyResponse = await request(app)
            .get(`/${otherGroupId}/maps/${otherMapId}/points`)
            .set("Authorization", `Bearer ${otherUserAccessToken}`)
            .expect(200);

        const remainingIds = verifyResponse.body.map((point: any) =>
            String(point.id),
        );
        expect(remainingIds).toContain(pointId);
    });

    it("DELETE /:groupId/maps/:mapId/points should return 403 when map does not belong to group", async () => {
        const pointResponse = await request(app)
            .post(`/${groupId}/maps/${mapId}/points`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send(testMapPoint);

        const pointId = String(pointResponse.body.id);

        const response = await request(app)
            .delete(`/${otherGroupId}/maps/${mapId}/points`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ pointIds: [pointId] })
            .expect(403);

        expect(response.body).toHaveProperty("error");

        const verifyResponse = await request(app)
            .get(`/${groupId}/maps/${mapId}/points`)
            .set("Authorization", `Bearer ${accessToken}`)
            .expect(200);

        const remainingIds = verifyResponse.body.map((point: any) =>
            String(point.id),
        );
        expect(remainingIds).toContain(pointId);
    });

    it("DELETE /:groupId/maps/:mapId/points should return 400 with empty pointIds array", async () => {
        const response = await request(app)
            .delete(`/${groupId}/maps/${mapId}/points`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ pointIds: [] })
            .expect(400);

        expect(response.body).toHaveProperty("name", "InvalidRequestError");
    });

    it("DELETE /:groupId/maps/:mapId/points should return 400 without pointIds", async () => {
        const response = await request(app)
            .delete(`/${groupId}/maps/${mapId}/points`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({})
            .expect(400);

        expect(response.body).toHaveProperty("name", "InvalidRequestError");
    });

    it("DELETE /:groupId/maps/:mapId/points should return 401 without token", async () => {
        const response = await request(app)
            .delete(`/${groupId}/maps/${mapId}/points`)
            .send({ pointIds: ["1"] })
            .expect(401);

        expect(response.body).toHaveProperty("error");
    });

    it("DELETE /:groupId/maps/:mapId/points should return 401 with invalid token", async () => {
        const response = await request(app)
            .delete(`/${groupId}/maps/${mapId}/points`)
            .set("Authorization", "Bearer invalid-token")
            .send({ pointIds: ["1"] })
            .expect(401);

        expect(response.body).toHaveProperty("error");
    });

    it("DELETE /:groupId/maps/:mapId/points should handle non-existing point ids correcly", async () => {
        const beforeResponse = await request(app)
            .get(`/${groupId}/maps/${mapId}/points`)
            .set("Authorization", `Bearer ${accessToken}`)
            .expect(200);

        const initialCount = beforeResponse.body.length;

        await request(app)
            .delete(`/${groupId}/maps/${mapId}/points`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ pointIds: ["999999", "888888"] })
            .expect(204);

        const afterResponse = await request(app)
            .get(`/${groupId}/maps/${mapId}/points`)
            .set("Authorization", `Bearer ${accessToken}`)
            .expect(200);

        expect(afterResponse.body.length).toBe(initialCount);
    });
});
