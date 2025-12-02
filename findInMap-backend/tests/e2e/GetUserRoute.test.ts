import request from "supertest";

import { getTestApp } from "./setup";

describe("Get User Route", () => {
    let app: any;

    beforeAll(() => {
        app = getTestApp();
    });

    it("GET /users/me should return current user data", async () => {
        const uniqueUser = {
            name: "John",
            surname: "Doe",
            email: `getuser-test-${Date.now()}${Math.random()}@example.com`,
            password: "testpass123",
        };

        await request(app).post("/users").send(uniqueUser);

        const loginResponse = await request(app).post("/users/login").send({
            email: uniqueUser.email,
            password: uniqueUser.password,
        });

        const token = loginResponse.body.token;

        const response = await request(app)
            .get("/users/me")
            .set("Authorization", `Bearer ${token}`)
            .expect(200);

        expect(response.body).toHaveProperty("id");
        expect(response.body.name).toBe(uniqueUser.name);
        expect(response.body.surname).toBe(uniqueUser.surname);
        expect(response.body.email).toBe(uniqueUser.email);
        expect(response.body).not.toHaveProperty("password");
    });

    it("GET /users/me should return 401 without token", async () => {
        await request(app).get("/users/me").expect(401);
    });

    it("GET /users/me should return 401 with invalid token", async () => {
        await request(app)
            .get("/users/me")
            .set("Authorization", "Bearer invalid-token")
            .expect(401);
    });
});
