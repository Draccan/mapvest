import request from "supertest";

import { getTestApp } from "./setup";
import { testUser } from "./helpers";

describe("Create User Route", () => {
    let app: any;

    beforeAll(() => {
        app = getTestApp();
    });

    it("POST /users should create a new user", async () => {
        const uniqueUser = {
            ...testUser,
            email: `unique-${Date.now()}@example.com`,
        };

        const response = await request(app)
            .post("/users")
            .send(uniqueUser)
            .expect(201);

        expect(response.body).toHaveProperty("id");
        expect(response.body.name).toBe(uniqueUser.name);
        expect(response.body.surname).toBe(uniqueUser.surname);
        expect(response.body.email).toBe(uniqueUser.email);
        expect(response.body).not.toHaveProperty("password");
    });

    it("POST /users should return 409 for duplicate email", async () => {
        await request(app).post("/users").send(testUser);

        const response = await request(app)
            .post("/users")
            .send(testUser)
            .expect(409);

        expect(response.body).toHaveProperty("message");
    });
});
