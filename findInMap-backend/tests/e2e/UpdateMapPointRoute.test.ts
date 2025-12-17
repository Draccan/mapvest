import request from "supertest";

import { DrizzleGroupRepository } from "../../src/dependency-implementations/DrizzleGroupRepository";
import { DrizzleMapRepository } from "../../src/dependency-implementations/DrizzleMapRepository";
import { getTestApp } from "./setup";

describe("Update Map Point Route", () => {
    let app: any;
    let accessToken: string;
    let groupId: string;
    let mapId: string;
    let pointId: string;

    beforeAll(async () => {
        app = getTestApp();

        const uniqueUser = {
            name: "UpdatePoint",
            surname: "TestUser",
            email: `updatepoint-test-${Date.now()}@example.com`,
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

        const mapRepository = new DrizzleMapRepository();
        const map = await mapRepository.createMap(groupId, {
            name: "Test Map",
        });
        mapId = map.id;

        const createResponse = await request(app)
            .post(`/${groupId}/maps/${mapId}/points`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({
                long: 45.4642,
                lat: 9.19,
                description: "Original Theft",
                date: "2025-12-01",
            });

        pointId = createResponse.body.id;
    });

    it("PUT /:groupId/maps/:mapId/points/:pointId should update a map point with valid token", async () => {
        const updateData = {
            description: "Updated Theft",
            date: "2025-12-15",
        };

        const response = await request(app)
            .put(`/${groupId}/maps/${mapId}/points/${pointId}`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send(updateData)
            .expect(200);

        expect(response.body).toHaveProperty("id", pointId);
        expect(response.body.description).toBe(updateData.description);
        expect(response.body.date).toBe(updateData.date);
        expect(response.body.long).toBe(45.4642);
        expect(response.body.lat).toBe(9.19);
    });

    it("PUT /:groupId/maps/:mapId/points/:pointId should return 401 without token", async () => {
        const updateData = {
            description: "Updated Theft",
            date: "2025-12-15",
        };

        const response = await request(app)
            .put(`/${groupId}/maps/${mapId}/points/${pointId}`)
            .send(updateData)
            .expect(401);

        expect(response.body).toHaveProperty("error");
    });

    it("PUT /:groupId/maps/:mapId/points/:pointId should return 401 with invalid token", async () => {
        const updateData = {
            description: "Updated Theft",
            date: "2025-12-15",
        };

        const response = await request(app)
            .put(`/${groupId}/maps/${mapId}/points/${pointId}`)
            .set("Authorization", "Bearer invalid-token")
            .send(updateData)
            .expect(401);

        expect(response.body).toHaveProperty("error");
    });

    it("PUT /:groupId/maps/:mapId/points/:pointId should return 404 for non-existing point", async () => {
        const updateData = {
            description: "Updated Theft",
            date: "2025-12-15",
        };

        const nonExistingPointId = "00000000-0000-0000-0000-000000000000";

        const response = await request(app)
            .put(`/${groupId}/maps/${mapId}/points/${nonExistingPointId}`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send(updateData)
            .expect(404);

        expect(response.body).toHaveProperty("error");
    });

    it("PUT /:groupId/maps/:mapId/points/:pointId should update with category", async () => {
        const categoryResponse = await request(app)
            .post(`/${groupId}/maps/${mapId}/categories`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({
                description: "Test Category",
                color: "#FF0000",
            });

        const categoryId = categoryResponse.body.id;

        const updateData = {
            description: "Updated with Category",
            date: "2025-12-20",
            categoryId: categoryId,
        };

        const response = await request(app)
            .put(`/${groupId}/maps/${mapId}/points/${pointId}`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send(updateData)
            .expect(200);

        expect(response.body.categoryId).toBe(categoryId);
        expect(response.body.description).toBe(updateData.description);
    });

    it("PUT /:groupId/maps/:mapId/points/:pointId should update with dueDate", async () => {
        const updateData = {
            description: "Updated with Due Date",
            date: "2025-12-20",
            dueDate: "2025-12-31",
        };

        const response = await request(app)
            .put(`/${groupId}/maps/${mapId}/points/${pointId}`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send(updateData)
            .expect(200);

        expect(response.body.dueDate).toBe(updateData.dueDate);
        expect(response.body.description).toBe(updateData.description);
        expect(response.body.date).toBe(updateData.date);
    });
});
