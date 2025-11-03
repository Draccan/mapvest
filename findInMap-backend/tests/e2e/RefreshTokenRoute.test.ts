import request from "supertest";

import { getTestApp } from "./setup";

describe("Refresh Token Route", () => {
    let app: any;

    beforeAll(() => {
        app = getTestApp();
    });

    it("POST /token/refresh should refresh access token", async () => {
        const uniqueUser = {
            name: "Refresh",
            surname: "TestUser",
            email: `refresh-test-${Date.now()}@example.com`,
            password: "testpass123",
        };

        await request(app).post("/users").send(uniqueUser);

        const loginResponse = await request(app)
            .post("/users/login")
            .send({
                email: uniqueUser.email,
                password: uniqueUser.password,
            })
            .expect(200);

        const refreshToken = loginResponse.body.refreshToken;
        expect(refreshToken).toBeDefined();

        const refreshResponse = await request(app)
            .post("/token/refresh")
            .withCredentials()
            .set("Authorization", `Bearer ${refreshToken}`)
            .expect(200);

        expect(refreshResponse.body).toHaveProperty("accessToken");
        expect(refreshResponse.body).toHaveProperty("refreshToken");
        expect(typeof refreshResponse.body.accessToken).toBe("string");
        expect(typeof refreshResponse.body.refreshToken).toBe("string");
        expect(refreshResponse.body.refreshToken).not.toBe(refreshToken);
    });

    it("POST /token/refresh should return 401 for invalid refresh token", async () => {
        const response = await request(app)
            .post("/token/refresh")
            .set("Authorization", "Bearer invalid-refresh-token")
            .expect(401);

        expect(response.body).toHaveProperty("error");
    });

    it("POST /token/refresh should return 401 for missing Authorization header", async () => {
        const response = await request(app).post("/token/refresh").expect(401);

        expect(response.body).toHaveProperty("error");
    });
});
