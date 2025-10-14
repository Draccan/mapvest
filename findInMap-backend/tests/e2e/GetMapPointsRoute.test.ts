import request from "supertest";

import { getTestApp } from "./setup";
import { testMapPoint, testUser } from "./helpers";

describe("Get Map Points Route", () => {
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

    it("GET /api/map-points should return empty array initially", async () => {
        const response = await request(app)
            .get("/api/map-points")
            .set("Authorization", `Bearer ${accessToken}`)
            .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
    });

    it("GET /api/map-points should return created map points", async () => {
        await request(app)
            .post("/api/map-points")
            .set("Authorization", `Bearer ${accessToken}`)
            .send(testMapPoint);

        const response = await request(app)
            .get("/api/map-points")
            .set("Authorization", `Bearer ${accessToken}`)
            .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
    });

    it("GET /api/map-points should return 401 without token", async () => {
        const response = await request(app).get("/api/map-points").expect(401);
        expect(response.body).toHaveProperty("error");
    });

    it("GET /api/map-points should return 401 with invalid token", async () => {
        const response = await request(app)
            .get("/api/map-points")
            .set("Authorization", "Bearer invalid-token")
            .expect(401);
        expect(response.body).toHaveProperty("error");
    });
});
