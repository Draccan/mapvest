import request from "supertest";

import { getTestApp } from "./setup";
import { testMapPoint, testUser } from "./helpers";

describe("Create Map Point Route", () => {
    let app: any;
    let accessToken: string;

    beforeAll(async () => {
        app = getTestApp();

        await request(app).post("/users").send(testUser);

        const loginResponse = await request(app).post("/users/login").send({
            email: testUser.email,
            password: testUser.password,
        });

        accessToken = loginResponse.body.token;
    });

    it("POST /map-points should create a new map point with valid token", async () => {
        const response = await request(app)
            .post("/map-points")
            .set("Authorization", `Bearer ${accessToken}`)
            .send(testMapPoint)
            .expect(201);

        expect(response.body).toHaveProperty("id");
        expect(response.body.long).toBe(testMapPoint.long);
        expect(response.body.lat).toBe(testMapPoint.lat);
        expect(response.body.type).toBe(testMapPoint.type);
    });

    it("POST /map-points should return 401 without token", async () => {
        const response = await request(app)
            .post("/map-points")
            .send(testMapPoint)
            .expect(401);
        expect(response.body).toHaveProperty("error");
    });

    it("POST /map-points should return 401 with invalid token", async () => {
        const response = await request(app)
            .post("/map-points")
            .set("Authorization", "Bearer invalid-token")
            .send(testMapPoint)
            .expect(401);
        expect(response.body).toHaveProperty("error");
    });
});
