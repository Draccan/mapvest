import request from "supertest";

import { DrizzleGroupRepository } from "../../src/dependency-implementations/DrizzleGroupRepository";
import { getTestApp } from "./setup";

describe("Create Map Point Route", () => {
    let app: any;
    let accessToken: string;
    let groupId: string;
    let mapId: string;

    beforeAll(async () => {
        app = getTestApp();

        const uniqueUser = {
            name: "MapPoint",
            surname: "TestUser",
            email: `mappoint-test-${Date.now()}@example.com`,
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

    it("POST /:groupId/maps/:mapId/points should create a new map point with valid token", async () => {
        const testMapPoint = {
            long: 45.4642,
            lat: 9.19,
            description: "THEFT",
            date: "2025-12-03",
        };

        const response = await request(app)
            .post(`/${groupId}/maps/${mapId}/points`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send(testMapPoint)
            .expect(201);

        expect(response.body).toHaveProperty("id");
        expect(response.body.long).toBe(testMapPoint.long);
        expect(response.body.lat).toBe(testMapPoint.lat);
        expect(response.body.description).toBe(testMapPoint.description);
    });

    it("POST /:groupId/maps/:mapId/points should create a new map point with dueDate", async () => {
        const testMapPointWithDueDate = {
            long: 45.4642,
            lat: 9.19,
            description: "THEFT",
            date: "2025-12-03",
            dueDate: "2025-12-15",
        };

        const response = await request(app)
            .post(`/${groupId}/maps/${mapId}/points`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send(testMapPointWithDueDate)
            .expect(201);

        expect(response.body).toHaveProperty("id");
        expect(response.body.long).toBe(testMapPointWithDueDate.long);
        expect(response.body.lat).toBe(testMapPointWithDueDate.lat);
        expect(response.body.description).toBe(
            testMapPointWithDueDate.description,
        );
        expect(response.body.dueDate).toBe(testMapPointWithDueDate.dueDate);
    });

    it("POST /:groupId/maps/:mapId/points should create a new map point with notes", async () => {
        const testMapPointWithNotes = {
            long: 45.4642,
            lat: 9.19,
            description: "THEFT",
            date: "2025-12-03",
            notes: "Additional notes about this location",
        };

        const response = await request(app)
            .post(`/${groupId}/maps/${mapId}/points`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send(testMapPointWithNotes)
            .expect(201);

        expect(response.body).toHaveProperty("id");
        expect(response.body.long).toBe(testMapPointWithNotes.long);
        expect(response.body.lat).toBe(testMapPointWithNotes.lat);
        expect(response.body.description).toBe(
            testMapPointWithNotes.description,
        );
        expect(response.body.notes).toBe(testMapPointWithNotes.notes);
    });

    it("POST /:groupId/maps/:mapId/points should return 401 without token", async () => {
        const testMapPoint = {
            long: 45.4642,
            lat: 9.19,
            description: "THEFT",
            date: "2025-12-03",
        };

        const response = await request(app)
            .post(`/${groupId}/maps/${mapId}/points`)
            .send(testMapPoint)
            .expect(401);
        expect(response.body).toHaveProperty("error");
    });

    it("POST /map-points should return 401 with invalid token", async () => {
        const testMapPoint = {
            long: 45.4642,
            lat: 9.19,
            description: "THEFT",
            date: "01/01/2023",
        };

        const response = await request(app)
            .post("/map-points")
            .set("Authorization", "Bearer invalid-token")
            .send(testMapPoint)
            .expect(401);
        expect(response.body).toHaveProperty("error");
    });
});
