import request from "supertest";
import { UserGroupRole } from "../../src/core/commons/enums";
import { DrizzleGroupRepository } from "../../src/dependency-implementations/DrizzleGroupRepository";
import { DrizzleUserRepository } from "../../src/dependency-implementations/DrizzleUserRepository";
import { getTestApp } from "./setup";

describe("POST /groups/:groupId/users", () => {
    it("should add multiple users to a group successfully", async () => {
        const app = getTestApp();
        const groupRepository = new DrizzleGroupRepository();
        const userRepository = new DrizzleUserRepository();

        const owner = {
            name: "Owner",
            surname: "User",
            email: `owner-${Date.now()}${Math.random()}@example.com`,
            password: "password123",
        };

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

        await request(app).post("/users").send(owner);
        const createdUser1 = await userRepository.create(user1);
        const createdUser2 = await userRepository.create(user2);

        const loginResponse = await request(app).post("/users/login").send({
            email: owner.email,
            password: owner.password,
        });

        const token = loginResponse.body.token;
        const ownerId = loginResponse.body.user.id;

        const group = await groupRepository.createGroup("Test Group", ownerId);

        const response = await request(app)
            .post(`/groups/${group.id}/users`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                userIds: [createdUser1.id, createdUser2.id],
            });

        expect(response.status).toBe(204);

        const groupUsers = await groupRepository.findUsersByGroupId(group.id);
        expect(groupUsers.length).toBe(3);
        expect(groupUsers.map((u) => u.userId)).toContain(createdUser1.id);
        expect(groupUsers.map((u) => u.userId)).toContain(createdUser2.id);
    });

    it("should allow admin to add users to group", async () => {
        const app = getTestApp();
        const groupRepository = new DrizzleGroupRepository();
        const userRepository = new DrizzleUserRepository();

        const owner = {
            name: "Owner",
            surname: "User",
            email: `owner-${Date.now()}${Math.random()}@example.com`,
            password: "password123",
        };

        const admin = {
            name: "Admin",
            surname: "User",
            email: `admin-${Date.now()}${Math.random()}@example.com`,
            password: "password123",
        };

        const newUser = {
            name: "New",
            surname: "User",
            email: `newuser-${Date.now()}${Math.random()}@example.com`,
            password: "password123",
        };

        await request(app).post("/users").send(owner);
        await request(app).post("/users").send(admin);
        const createdNewUser = await userRepository.create(newUser);

        const ownerLogin = await request(app).post("/users/login").send({
            email: owner.email,
            password: owner.password,
        });

        const ownerId = ownerLogin.body.user.id;
        const group = await groupRepository.createGroup(
            "Admin Test Group",
            ownerId,
        );

        const adminLogin = await request(app).post("/users/login").send({
            email: admin.email,
            password: admin.password,
        });

        const adminId = adminLogin.body.user.id;
        await groupRepository.addUserToGroup(
            adminId,
            group.id,
            UserGroupRole.Admin,
        );

        const adminToken = adminLogin.body.token;

        const response = await request(app)
            .post(`/groups/${group.id}/users`)
            .set("Authorization", `Bearer ${adminToken}`)
            .send({
                userIds: [createdNewUser.id],
            });

        expect(response.status).toBe(204);

        const groupUsers = await groupRepository.findUsersByGroupId(group.id);
        expect(groupUsers.map((u) => u.userId)).toContain(createdNewUser.id);
    });

    it("should return 401 when not authenticated", async () => {
        const app = getTestApp();

        const response = await request(app)
            .post("/groups/some-group-id/users")
            .send({
                userIds: ["user1-id", "user2-id"],
            });

        expect(response.status).toBe(401);
    });

    it("should return 403 when user does not have access to group", async () => {
        const app = getTestApp();
        const groupRepository = new DrizzleGroupRepository();
        const userRepository = new DrizzleUserRepository();

        const owner = {
            name: "Owner",
            surname: "User",
            email: `owner-${Date.now()}${Math.random()}@example.com`,
            password: "password123",
        };

        const otherUser = {
            name: "Other",
            surname: "User",
            email: `other-${Date.now()}${Math.random()}@example.com`,
            password: "password123",
        };

        const targetUser = {
            name: "Target",
            surname: "User",
            email: `target-${Date.now()}${Math.random()}@example.com`,
            password: "password123",
        };

        await request(app).post("/users").send(owner);
        await request(app).post("/users").send(otherUser);
        const createdTargetUser = await userRepository.create(targetUser);

        const ownerLogin = await request(app).post("/users/login").send({
            email: owner.email,
            password: owner.password,
        });

        const ownerId = ownerLogin.body.user.id;
        const group = await groupRepository.createGroup(
            "Private Group",
            ownerId,
        );

        const otherLogin = await request(app).post("/users/login").send({
            email: otherUser.email,
            password: otherUser.password,
        });

        const otherToken = otherLogin.body.token;

        const response = await request(app)
            .post(`/groups/${group.id}/users`)
            .set("Authorization", `Bearer ${otherToken}`)
            .send({
                userIds: [createdTargetUser.id],
            });

        expect(response.status).toBe(403);
    });

    it("should return 403 when user is contributor (not admin or owner)", async () => {
        const app = getTestApp();
        const groupRepository = new DrizzleGroupRepository();
        const userRepository = new DrizzleUserRepository();

        const owner = {
            name: "Owner",
            surname: "User",
            email: `owner-${Date.now()}${Math.random()}@example.com`,
            password: "password123",
        };

        const contributor = {
            name: "Contributor",
            surname: "User",
            email: `contributor-${Date.now()}${Math.random()}@example.com`,
            password: "password123",
        };

        const newUser = {
            name: "New",
            surname: "User",
            email: `newuser-${Date.now()}${Math.random()}@example.com`,
            password: "password123",
        };

        await request(app).post("/users").send(owner);
        await request(app).post("/users").send(contributor);
        const createdNewUser = await userRepository.create(newUser);

        const ownerLogin = await request(app).post("/users/login").send({
            email: owner.email,
            password: owner.password,
        });

        const ownerId = ownerLogin.body.user.id;
        const group = await groupRepository.createGroup(
            "Contributor Test Group",
            ownerId,
        );

        const contributorLogin = await request(app).post("/users/login").send({
            email: contributor.email,
            password: contributor.password,
        });

        const contributorId = contributorLogin.body.user.id;
        await groupRepository.addUserToGroup(
            contributorId,
            group.id,
            UserGroupRole.Contributor,
        );

        const contributorToken = contributorLogin.body.token;

        const response = await request(app)
            .post(`/groups/${group.id}/users`)
            .set("Authorization", `Bearer ${contributorToken}`)
            .send({
                userIds: [createdNewUser.id],
            });

        expect(response.status).toBe(403);
    });

    it("should return 400 when userIds is missing", async () => {
        const app = getTestApp();
        const groupRepository = new DrizzleGroupRepository();

        const owner = {
            name: "Owner",
            surname: "User",
            email: `owner-${Date.now()}${Math.random()}@example.com`,
            password: "password123",
        };

        await request(app).post("/users").send(owner);

        const loginResponse = await request(app).post("/users/login").send({
            email: owner.email,
            password: owner.password,
        });

        const token = loginResponse.body.token;
        const ownerId = loginResponse.body.user.id;

        const group = await groupRepository.createGroup("Test Group", ownerId);

        const response = await request(app)
            .post(`/groups/${group.id}/users`)
            .set("Authorization", `Bearer ${token}`)
            .send({});

        expect(response.status).toBe(400);
    });

    it("should return 400 when userIds is empty array", async () => {
        const app = getTestApp();
        const groupRepository = new DrizzleGroupRepository();

        const owner = {
            name: "Owner",
            surname: "User",
            email: `owner-${Date.now()}${Math.random()}@example.com`,
            password: "password123",
        };

        await request(app).post("/users").send(owner);

        const loginResponse = await request(app).post("/users/login").send({
            email: owner.email,
            password: owner.password,
        });

        const token = loginResponse.body.token;
        const ownerId = loginResponse.body.user.id;

        const group = await groupRepository.createGroup("Test Group", ownerId);

        const response = await request(app)
            .post(`/groups/${group.id}/users`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                userIds: [],
            });

        expect(response.status).toBe(400);
    });

    it("should return 400 when userIds is not an array", async () => {
        const app = getTestApp();
        const groupRepository = new DrizzleGroupRepository();

        const owner = {
            name: "Owner",
            surname: "User",
            email: `owner-${Date.now()}${Math.random()}@example.com`,
            password: "password123",
        };

        await request(app).post("/users").send(owner);

        const loginResponse = await request(app).post("/users/login").send({
            email: owner.email,
            password: owner.password,
        });

        const token = loginResponse.body.token;
        const ownerId = loginResponse.body.user.id;

        const group = await groupRepository.createGroup("Test Group", ownerId);

        const response = await request(app)
            .post(`/groups/${group.id}/users`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                userIds: "not-an-array",
            });

        expect(response.status).toBe(400);
    });

    it("should add single user when userIds contains one id", async () => {
        const app = getTestApp();
        const groupRepository = new DrizzleGroupRepository();
        const userRepository = new DrizzleUserRepository();

        const owner = {
            name: "Owner",
            surname: "User",
            email: `owner-${Date.now()}${Math.random()}@example.com`,
            password: "password123",
        };

        const newUser = {
            name: "New",
            surname: "User",
            email: `newuser-${Date.now()}${Math.random()}@example.com`,
            password: "password123",
        };

        await request(app).post("/users").send(owner);
        const createdNewUser = await userRepository.create(newUser);

        const loginResponse = await request(app).post("/users/login").send({
            email: owner.email,
            password: owner.password,
        });

        const token = loginResponse.body.token;
        const ownerId = loginResponse.body.user.id;

        const group = await groupRepository.createGroup(
            "Single User Group",
            ownerId,
        );

        const response = await request(app)
            .post(`/groups/${group.id}/users`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                userIds: [createdNewUser.id],
            });

        expect(response.status).toBe(204);

        const groupUsers = await groupRepository.findUsersByGroupId(group.id);
        expect(groupUsers.length).toBe(2);
        expect(groupUsers.map((u) => u.userId)).toContain(createdNewUser.id);
    });
});
