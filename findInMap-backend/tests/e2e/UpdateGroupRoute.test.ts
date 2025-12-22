import request from "supertest";
import { DrizzleGroupRepository } from "../../src/dependency-implementations/DrizzleGroupRepository";
import { getTestApp } from "./setup";

describe("PUT /groups/:groupId", () => {
    it("should update a group name successfully", async () => {
        const app = getTestApp();
        const groupRepository = new DrizzleGroupRepository();

        const uniqueUser = {
            name: "John",
            surname: "Doe",
            email: `john-update-${Date.now()}${Math.random()}@example.com`,
            password: "password123",
        };

        await request(app).post("/users").send(uniqueUser);

        const loginResponse = await request(app).post("/users/login").send({
            email: uniqueUser.email,
            password: uniqueUser.password,
        });

        const token = loginResponse.body.token;
        const userId = loginResponse.body.user.id;

        const group = await groupRepository.createGroup(
            "Original Name",
            userId,
        );

        const response = await request(app)
            .put(`/groups/${group.id}`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                name: "Updated Name",
            });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("id", group.id);
        expect(response.body).toHaveProperty("name", "Updated Name");
    });

    it("should return 401 when not authenticated", async () => {
        const app = getTestApp();
        const response = await request(app).put("/groups/some-group-id").send({
            name: "Updated Name",
        });

        expect(response.status).toBe(401);
    });

    it("should return 403 when user does not have access to group", async () => {
        const app = getTestApp();
        const groupRepository = new DrizzleGroupRepository();

        const user1 = {
            name: "User",
            surname: "One",
            email: `user1-${Date.now()}${Math.random()}@example.com`,
            password: "password123",
        };

        const user2 = {
            name: "User",
            surname: "Two",
            email: `user2-${Date.now()}${Math.random()}@example.com`,
            password: "password123",
        };

        await request(app).post("/users").send(user1);
        await request(app).post("/users").send(user2);

        const login1 = await request(app).post("/users/login").send({
            email: user1.email,
            password: user1.password,
        });

        const userId1 = login1.body.user.id;
        const group = await groupRepository.createGroup(
            "User 1 Group",
            userId1,
        );

        const login2 = await request(app).post("/users/login").send({
            email: user2.email,
            password: user2.password,
        });

        const token2 = login2.body.token;

        const response = await request(app)
            .put(`/groups/${group.id}`)
            .set("Authorization", `Bearer ${token2}`)
            .send({
                name: "Hacked Name",
            });

        expect(response.status).toBe(403);
    });

    it("should return 403 when group does not exist", async () => {
        const app = getTestApp();

        const uniqueUser = {
            name: "John",
            surname: "Doe",
            email: `john-notfound-${Date.now()}${Math.random()}@example.com`,
            password: "password123",
        };

        await request(app).post("/users").send(uniqueUser);

        const loginResponse = await request(app).post("/users/login").send({
            email: uniqueUser.email,
            password: uniqueUser.password,
        });

        const token = loginResponse.body.token;

        const response = await request(app)
            .put("/groups/00000000-0000-0000-0000-000000000000")
            .set("Authorization", `Bearer ${token}`)
            .send({
                name: "Updated Name",
            });

        expect(response.status).toBe(403);
    });

    it("should return 400 when name is missing", async () => {
        const app = getTestApp();
        const groupRepository = new DrizzleGroupRepository();

        const uniqueUser = {
            name: "John",
            surname: "Doe",
            email: `john-missing-${Date.now()}${Math.random()}@example.com`,
            password: "password123",
        };

        await request(app).post("/users").send(uniqueUser);

        const loginResponse = await request(app).post("/users/login").send({
            email: uniqueUser.email,
            password: uniqueUser.password,
        });

        const token = loginResponse.body.token;
        const userId = loginResponse.body.user.id;

        const group = await groupRepository.createGroup("Test Group", userId);

        const response = await request(app)
            .put(`/groups/${group.id}`)
            .set("Authorization", `Bearer ${token}`)
            .send({});

        expect(response.status).toBe(400);
    });

    it("should return 400 when name is not a string", async () => {
        const app = getTestApp();
        const groupRepository = new DrizzleGroupRepository();

        const uniqueUser = {
            name: "John",
            surname: "Doe",
            email: `john-notstring-${Date.now()}${Math.random()}@example.com`,
            password: "password123",
        };

        await request(app).post("/users").send(uniqueUser);

        const loginResponse = await request(app).post("/users/login").send({
            email: uniqueUser.email,
            password: uniqueUser.password,
        });

        const token = loginResponse.body.token;
        const userId = loginResponse.body.user.id;

        const group = await groupRepository.createGroup("Test Group", userId);

        const response = await request(app)
            .put(`/groups/${group.id}`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                name: 123,
            });

        expect(response.status).toBe(400);
    });

    it("should return 400 when name is empty string", async () => {
        const app = getTestApp();
        const groupRepository = new DrizzleGroupRepository();

        const uniqueUser = {
            name: "John",
            surname: "Doe",
            email: `john-empty-${Date.now()}${Math.random()}@example.com`,
            password: "password123",
        };

        await request(app).post("/users").send(uniqueUser);

        const loginResponse = await request(app).post("/users/login").send({
            email: uniqueUser.email,
            password: uniqueUser.password,
        });

        const token = loginResponse.body.token;
        const userId = loginResponse.body.user.id;

        const group = await groupRepository.createGroup("Test Group", userId);

        const response = await request(app)
            .put(`/groups/${group.id}`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                name: "",
            });

        expect(response.status).toBe(400);
    });
});
