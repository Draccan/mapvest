import request from "supertest";

import { DrizzleGroupRepository } from "../../src/dependency-implementations/DrizzleGroupRepository";
import { getTestApp } from "./setup";

describe("DeleteMapCategoryRoute", () => {
    let app: any;
    let accessToken: string;
    let groupId: string;
    let mapId: string;
    let userId: string;

    beforeAll(async () => {
        app = getTestApp();

        const uniqueUser = {
            name: "DeleteCategory",
            surname: "TestUser",
            email: `delete-category-test-${Date.now()}@example.com`,
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
            .send({ name: "Test Map" });

        mapId = mapResponse.body.id;
    });

    it("DELETE /:groupId/maps/:mapId/categories/:categoryId should successfully delete a category", async () => {
        const categoryResponse = await request(app)
            .post(`/${groupId}/maps/${mapId}/categories`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({
                description: "Category to Delete",
                color: "#FF0000",
            });

        const categoryId = categoryResponse.body.id;

        await request(app)
            .delete(`/${groupId}/maps/${mapId}/categories/${categoryId}`)
            .set("Authorization", `Bearer ${accessToken}`)
            .expect(204);

        const categoriesResponse = await request(app)
            .get(`/${groupId}/maps/${mapId}/categories`)
            .set("Authorization", `Bearer ${accessToken}`)
            .expect(200);

        const categoryIds = categoriesResponse.body.map((c: any) => c.id);
        expect(categoryIds).not.toContain(categoryId);
    });

    it("DELETE /:groupId/maps/:mapId/categories/:categoryId should remove category from associated points", async () => {
        const categoryResponse = await request(app)
            .post(`/${groupId}/maps/${mapId}/categories`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({
                description: "Category with Points",
                color: "#00FF00",
            });

        const categoryId = categoryResponse.body.id;

        const pointResponse = await request(app)
            .post(`/${groupId}/maps/${mapId}/points`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({
                long: 12.4964,
                lat: 41.9028,
                description: "Point with Category",
                date: "2024-01-01",
                categoryId: categoryId,
            });

        const pointId = pointResponse.body.id;

        await request(app)
            .delete(`/${groupId}/maps/${mapId}/categories/${categoryId}`)
            .set("Authorization", `Bearer ${accessToken}`)
            .expect(204);

        const pointsResponse = await request(app)
            .get(`/${groupId}/maps/${mapId}/points`)
            .set("Authorization", `Bearer ${accessToken}`)
            .expect(200);

        const point = pointsResponse.body.find((p: any) => p.id === pointId);
        expect(point).toBeDefined();
        expect(point.categoryId).toBeFalsy();
    });

    it("DELETE /:groupId/maps/:mapId/categories/:categoryId should return 403 when user has no access to group", async () => {
        const categoryResponse = await request(app)
            .post(`/${groupId}/maps/${mapId}/categories`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({
                description: "Test Category",
                color: "#0000FF",
            });

        const categoryId = categoryResponse.body.id;

        const otherUser = {
            name: "Other",
            surname: "User",
            email: `other-user-delete-category-${Date.now()}@example.com`,
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
            .delete(`/${groupId}/maps/${mapId}/categories/${categoryId}`)
            .set("Authorization", `Bearer ${otherAccessToken}`)
            .expect(403);

        expect(response.body).toHaveProperty("error");
    });

    it("DELETE /:groupId/maps/:mapId/categories/:categoryId should return 403 when map does not belong to group", async () => {
        const otherUser = {
            name: "Other",
            surname: "User",
            email: `other-user-delete-category2-${Date.now()}@example.com`,
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

        const otherMapResponse = await request(app)
            .post(`/${otherGroup.id}/maps`)
            .set("Authorization", `Bearer ${otherAccessToken}`)
            .send({ name: "Other Map" });

        const otherMapId = otherMapResponse.body.id;

        const categoryResponse = await request(app)
            .post(`/${otherGroup.id}/maps/${otherMapId}/categories`)
            .set("Authorization", `Bearer ${otherAccessToken}`)
            .send({
                description: "Other Category",
                color: "#FFFF00",
            });

        const categoryId = categoryResponse.body.id;

        const response = await request(app)
            .delete(`/${groupId}/maps/${otherMapId}/categories/${categoryId}`)
            .set("Authorization", `Bearer ${accessToken}`)
            .expect(403);

        expect(response.body).toHaveProperty("error");
    });

    it("DELETE /:groupId/maps/:mapId/categories/:categoryId should return 401 without token", async () => {
        const categoryResponse = await request(app)
            .post(`/${groupId}/maps/${mapId}/categories`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({
                description: "Auth Test Category",
                color: "#FF00FF",
            });

        const categoryId = categoryResponse.body.id;

        const response = await request(app)
            .delete(`/${groupId}/maps/${mapId}/categories/${categoryId}`)
            .expect(401);

        expect(response.body).toHaveProperty("error");
    });

    it("DELETE /:groupId/maps/:mapId/categories/:categoryId should return 401 with invalid token", async () => {
        const categoryResponse = await request(app)
            .post(`/${groupId}/maps/${mapId}/categories`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({
                description: "Invalid Token Category",
                color: "#00FFFF",
            });

        const categoryId = categoryResponse.body.id;

        const response = await request(app)
            .delete(`/${groupId}/maps/${mapId}/categories/${categoryId}`)
            .set("Authorization", "Bearer invalid-token")
            .expect(401);

        expect(response.body).toHaveProperty("error");
    });

    it("DELETE /:groupId/maps/:mapId/categories/:categoryId should handle non-existent category gracefully", async () => {
        await request(app)
            .delete(
                `/${groupId}/maps/${mapId}/categories/00000000-0000-0000-0000-000000000000`,
            )
            .set("Authorization", `Bearer ${accessToken}`)
            .expect(204);
    });

    it("DELETE /:groupId/maps/:mapId/categories/:categoryId should not affect other categories", async () => {
        const category1Response = await request(app)
            .post(`/${groupId}/maps/${mapId}/categories`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({
                description: "Category 1",
                color: "#111111",
            });

        const category2Response = await request(app)
            .post(`/${groupId}/maps/${mapId}/categories`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({
                description: "Category 2",
                color: "#222222",
            });

        const category1Id = category1Response.body.id;
        const category2Id = category2Response.body.id;

        await request(app)
            .delete(`/${groupId}/maps/${mapId}/categories/${category1Id}`)
            .set("Authorization", `Bearer ${accessToken}`)
            .expect(204);

        const categoriesResponse = await request(app)
            .get(`/${groupId}/maps/${mapId}/categories`)
            .set("Authorization", `Bearer ${accessToken}`)
            .expect(200);

        const categoryIds = categoriesResponse.body.map((c: any) => c.id);
        expect(categoryIds).not.toContain(category1Id);
        expect(categoryIds).toContain(category2Id);
    });

    it("DELETE /:groupId/maps/:mapId/categories/:categoryId should remove category from multiple points", async () => {
        const newMapResponse = await request(app)
            .post(`/${groupId}/maps`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ name: "Map for Multiple Points" });

        const newMapId = newMapResponse.body.id;

        const categoryResponse = await request(app)
            .post(`/${groupId}/maps/${newMapId}/categories`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({
                description: "Category for Multiple Points",
                color: "#AABBCC",
            });

        const categoryId = categoryResponse.body.id;

        await request(app)
            .post(`/${groupId}/maps/${newMapId}/points`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({
                long: 12.4964,
                lat: 41.9028,
                description: "Point 1",
                date: "2024-01-01",
                categoryId: categoryId,
            });

        await request(app)
            .post(`/${groupId}/maps/${newMapId}/points`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({
                long: 13.4964,
                lat: 42.9028,
                description: "Point 2",
                date: "2024-01-02",
                categoryId: categoryId,
            });

        await request(app)
            .post(`/${groupId}/maps/${newMapId}/points`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({
                long: 14.4964,
                lat: 43.9028,
                description: "Point 3",
                date: "2024-01-03",
                categoryId: categoryId,
            });

        await request(app)
            .delete(`/${groupId}/maps/${newMapId}/categories/${categoryId}`)
            .set("Authorization", `Bearer ${accessToken}`)
            .expect(204);

        const pointsResponse = await request(app)
            .get(`/${groupId}/maps/${newMapId}/points`)
            .set("Authorization", `Bearer ${accessToken}`)
            .expect(200);

        expect(pointsResponse.body.length).toBe(3);
        expect(pointsResponse.body.every((p: any) => !p.categoryId)).toBe(true);
    });
});
