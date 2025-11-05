import request from "supertest";

import { getTestApp } from "./setup";

describe("Login User Route", () => {
    let app: any;

    beforeAll(() => {
        app = getTestApp();
    });

    it("POST /users/login should authenticate user", async () => {
        const uniqueUser = {
            name: "Login",
            surname: "TestUser",
            email: `login-test-${Date.now()}${Math.random()}@example.com`,
            password: "testpass123",
        };

        await request(app).post("/users").send(uniqueUser);

        const response = await request(app)
            .post("/users/login")
            .send({
                email: uniqueUser.email,
                password: uniqueUser.password,
            })
            .expect(200);

        expect(response.body).toHaveProperty("token");
        expect(response.body).toHaveProperty("refreshToken");
        expect(response.body).toHaveProperty("user");
        expect(response.body.user.email).toBe(uniqueUser.email);
    });

    it("POST /users/login should return 401 for invalid credentials", async () => {
        const uniqueUser = {
            name: "Login",
            surname: "TestUser",
            email: `login-invalid-${Date.now()}${Math.random()}@example.com`,
            password: "testpass123",
        };
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
