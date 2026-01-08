import request from "supertest";

import { getTestApp } from "./setup";
import { testUser } from "../helpers";

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

    it("POST /users should create a 'First Group' for the new user", async () => {
        const newUser = {
            name: "GroupTest",
            surname: "User",
            email: `grouptest-${Date.now()}@example.com`,
            password: "testpass123",
        };

        const createResponse = await request(app)
            .post("/users")
            .send(newUser)
            .expect(201);

        createResponse.body.id;

        const loginResponse = await request(app)
            .post("/users/login")
            .send({
                email: newUser.email,
                password: newUser.password,
            })
            .expect(200);

        const accessToken = loginResponse.body.token;

        const groupsResponse = await request(app)
            .get("/groups")
            .set("Authorization", `Bearer ${accessToken}`)
            .expect(200);

        expect(Array.isArray(groupsResponse.body)).toBe(true);
        expect(groupsResponse.body.length).toBe(1);
        expect(groupsResponse.body[0].name).toBe("First Group");
        expect(groupsResponse.body[0].role).toBe("owner");
    });

    it("POST /users should create a 'First Map' in the 'First Group' for the new user", async () => {
        const newUser = {
            name: "MapTest",
            surname: "User",
            email: `maptest-${Date.now()}@example.com`,
            password: "testpass123",
        };

        await request(app).post("/users").send(newUser).expect(201);

        const loginResponse = await request(app)
            .post("/users/login")
            .send({
                email: newUser.email,
                password: newUser.password,
            })
            .expect(200);

        const accessToken = loginResponse.body.token;

        const groupsResponse = await request(app)
            .get("/groups")
            .set("Authorization", `Bearer ${accessToken}`)
            .expect(200);

        const firstGroup = groupsResponse.body[0];
        expect(firstGroup.name).toBe("First Group");

        const mapsResponse = await request(app)
            .get(`/${firstGroup.id}/maps`)
            .set("Authorization", `Bearer ${accessToken}`)
            .expect(200);

        expect(Array.isArray(mapsResponse.body)).toBe(true);
        expect(mapsResponse.body.length).toBe(1);
        expect(mapsResponse.body[0].name).toBe("First Map");
    });
});
