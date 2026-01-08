import request from "supertest";

import { getTestApp } from "./setup";

describe("Get Group Users Route", () => {
    it("GET /groups/:groupId/users should return users in the group", async () => {
        const app = getTestApp();

        const uniqueUser = {
            name: "GroupUsers",
            surname: "TestUser",
            email: `group-users-test-${Date.now()}${Math.random()}@example.com`,
            password: "testpass123",
        };

        await request(app).post("/users").send(uniqueUser);

        const loginResponse = await request(app).post("/users/login").send({
            email: uniqueUser.email,
            password: uniqueUser.password,
        });

        const accessToken = loginResponse.body.token;

        const groupsResponse = await request(app)
            .get("/groups")
            .set("Authorization", `Bearer ${accessToken}`)
            .expect(200);

        expect(groupsResponse.body.length).toBeGreaterThan(0);
        const groupId = groupsResponse.body[0].id;

        const response = await request(app)
            .get(`/groups/${groupId}/users`)
            .set("Authorization", `Bearer ${accessToken}`)
            .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);

        const user = response.body[0];
        expect(typeof user.id).toBe("string");
        expect(typeof user.name).toBe("string");
        expect(typeof user.surname).toBe("string");
        expect(typeof user.email).toBe("string");
        expect(["owner", "admin", "contributor"]).toContain(user.userGroupRole);
    });

    it("GET /groups/:groupId/users should return 401 without token", async () => {
        const app = getTestApp();

        const response = await request(app)
            .get("/groups/some-group-id/users")
            .expect(401);

        expect(response.body).toHaveProperty("error");
    });

    it("GET /groups/:groupId/users should return 403 for unauthorized group", async () => {
        const app = getTestApp();

        const user1 = {
            name: "User1",
            surname: "TestUser",
            email: `user1-${Date.now()}${Math.random()}@example.com`,
            password: "testpass123",
        };

        const user2 = {
            name: "User2",
            surname: "TestUser",
            email: `user2-${Date.now()}${Math.random()}@example.com`,
            password: "testpass123",
        };

        await request(app).post("/users").send(user1);
        await request(app).post("/users").send(user2);

        const loginResponse1 = await request(app).post("/users/login").send({
            email: user1.email,
            password: user1.password,
        });

        const loginResponse2 = await request(app).post("/users/login").send({
            email: user2.email,
            password: user2.password,
        });

        const accessToken1 = loginResponse1.body.token;
        const accessToken2 = loginResponse2.body.token;

        const groupsResponse2 = await request(app)
            .get("/groups")
            .set("Authorization", `Bearer ${accessToken2}`)
            .expect(200);

        const user2GroupId = groupsResponse2.body[0].id;

        const response = await request(app)
            .get(`/groups/${user2GroupId}/users`)
            .set("Authorization", `Bearer ${accessToken1}`)
            .expect(403);

        expect(response.body).toHaveProperty("error");
    });
});
