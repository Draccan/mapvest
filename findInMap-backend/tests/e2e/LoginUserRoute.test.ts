import request from "supertest";

import { getTestApp } from "./setup";
import { testUser } from "./helpers";

describe("Login User Route", () => {
    let app: any;

    beforeAll(() => {
        app = getTestApp();
    });

    it("POST /users/login should authenticate user", async () => {
        await request(app).post("/users").send(testUser);

        const response = await request(app)
            .post("/users/login")
            .send({
                email: testUser.email,
                password: testUser.password,
            })
            .expect(200);

        expect(response.body).toHaveProperty("token");
        expect(response.body).toHaveProperty("refreshToken");
        expect(response.body).toHaveProperty("user");
        expect(response.body.user.email).toBe(testUser.email);
    });

    it("POST /users/login should return 401 for invalid credentials", async () => {
        const response = await request(app)
            .post("/users/login")
            .send({
                email: "nonexistent@example.com",
                password: "wrongpassword",
            })
            .expect(401);

        expect(response.body).toHaveProperty("error");
    });
});
