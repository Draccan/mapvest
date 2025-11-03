import request from "supertest";

import { getTestApp } from "./setup";

describe("Get Groups Route", () => {
    it("GET /groups should return user groups", async () => {
        const app = getTestApp();

        const uniqueUser = {
            name: "Groups",
            surname: "TestUser",
            email: `groups-test-${Date.now()}${Math.random()}@example.com`,
            password: "testpass123",
        };

        await request(app).post("/users").send(uniqueUser);

        const loginResponse = await request(app).post("/users/login").send({
            email: uniqueUser.email,
            password: uniqueUser.password,
        });

        const accessToken = loginResponse.body.token;

        const response = await request(app)
            .get("/groups")
            .set("Authorization", `Bearer ${accessToken}`)
            .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
    });

    it("GET /groups should return correct group structure when groups exist", async () => {
        const app = getTestApp();

        const uniqueUser = {
            name: "Groups",
            surname: "TestUser",
            email: `groups-test-${Date.now()}${Math.random()}@example.com`,
            password: "testpass123",
        };

        await request(app).post("/users").send(uniqueUser);

        const loginResponse = await request(app).post("/users/login").send({
            email: uniqueUser.email,
            password: uniqueUser.password,
        });

        const accessToken = loginResponse.body.token;

        const response = await request(app)
            .get("/groups")
            .set("Authorization", `Bearer ${accessToken}`)
            .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        if (response.body.length > 0) {
            const group = response.body[0];
            expect(typeof group.id).toBe("string");
            expect(typeof group.name).toBe("string");
            expect(["owner", "admin", "contributor"]).toContain(group.role);
        }
    });

    it("GET /groups should return 401 without token", async () => {
        const app = getTestApp();

        const uniqueUser = {
            name: "Groups",
            surname: "TestUser",
            email: `groups-test-${Date.now()}${Math.random()}@example.com`,
            password: "testpass123",
        };

        await request(app).post("/users").send(uniqueUser);

        const loginResponse = await request(app).post("/users/login").send({
            email: uniqueUser.email,
            password: uniqueUser.password,
        });

        const accessToken = loginResponse.body.token;

        const response = await request(app).get("/groups").expect(401);
        expect(response.body).toHaveProperty("error");
    });
});
