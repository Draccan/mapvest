import request from "supertest";

import { getTestApp } from "./setup";
import { testUser } from "./helpers";

describe("Logout User Route", () => {
    let app: any;

    beforeAll(() => {
        app = getTestApp();
    });

    it("POST /users/logout should logout successfully with valid access token", async () => {
        await request(app).post("/users").send(testUser);

        const loginResponse = await request(app)
            .post("/users/login")
            .send({
                email: testUser.email,
                password: testUser.password,
            })
            .expect(200);

        const refreshToken = loginResponse.body.refreshToken;
        expect(refreshToken).toBeDefined();

        const logoutResponse = await request(app)
            .post("/users/logout")
            .set("Authorization", `Bearer ${refreshToken}`)
            .expect(200);

        expect(logoutResponse.body).toHaveProperty(
            "message",
            "Successfully logged out",
        );

        const refreshResponse = await request(app)
            .post("/token/refresh")
            .set("Authorization", `Bearer ${refreshToken}`)
            .expect(401);

        expect(refreshResponse.body).toHaveProperty("error");
    });

    it("POST /users/logout should return 401 for missing Authorization header", async () => {
        const response = await request(app).post("/users/logout").expect(401);
        expect(response.body).toHaveProperty("error");
    });
});
