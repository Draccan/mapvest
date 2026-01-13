import request from "supertest";
import { UserGroupRole } from "../../src/core/commons/enums";
import { DrizzleGroupRepository } from "../../src/dependency-implementations/DrizzleGroupRepository";
import { DrizzleUserRepository } from "../../src/dependency-implementations/DrizzleUserRepository";
import { getTestApp } from "./setup";

describe("DELETE /groups/:groupId/users/:userId", () => {
    it("should remove a user from a group successfully when user is owner", async () => {
        const app = getTestApp();
        const groupRepository = new DrizzleGroupRepository();
        const userRepository = new DrizzleUserRepository();

        const owner = {
            name: "Owner",
            surname: "User",
            email: `owner-${Date.now()}${Math.random()}@example.com`,
            password: "password123",
        };

        const userToRemove = {
            name: "User",
            surname: "ToRemove",
            email: `usertoremove-${Date.now()}${Math.random()}@example.com`,
            password: "password123",
        };

        await request(app).post("/users").send(owner);
        const createdUser = await userRepository.create(userToRemove);

        const loginResponse = await request(app).post("/users/login").send({
            email: owner.email,
            password: owner.password,
        });

        const token = loginResponse.body.token;
        const ownerId = loginResponse.body.user.id;

        const group = await groupRepository.createGroup("Test Group", ownerId);

        await groupRepository.addUserToGroup(
            createdUser.id,
            group.id,
            UserGroupRole.Contributor,
        );

        let groupUsers = await groupRepository.findUsersByGroupId(group.id);
        expect(groupUsers.length).toBe(2);

        const response = await request(app)
            .delete(`/groups/${group.id}/users/${createdUser.id}`)
            .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(204);

        groupUsers = await groupRepository.findUsersByGroupId(group.id);
        expect(groupUsers.length).toBe(1);
        expect(groupUsers[0].userId).toBe(ownerId);
    });

    it("should allow admin to remove users from group", async () => {
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

        const userToRemove = {
            name: "User",
            surname: "ToRemove",
            email: `usertoremove-${Date.now()}${Math.random()}@example.com`,
            password: "password123",
        };

        await request(app).post("/users").send(owner);
        await request(app).post("/users").send(admin);
        const createdUser = await userRepository.create(userToRemove);

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

        await groupRepository.addUserToGroup(
            createdUser.id,
            group.id,
            UserGroupRole.Contributor,
        );

        let groupUsers = await groupRepository.findUsersByGroupId(group.id);
        expect(groupUsers.length).toBe(3);

        const adminToken = adminLogin.body.token;

        const response = await request(app)
            .delete(`/groups/${group.id}/users/${createdUser.id}`)
            .set("Authorization", `Bearer ${adminToken}`);

        expect(response.status).toBe(204);

        groupUsers = await groupRepository.findUsersByGroupId(group.id);
        expect(groupUsers.length).toBe(2);
        expect(groupUsers.map((u) => u.userId)).not.toContain(createdUser.id);
    });

    it("should return 401 when not authenticated", async () => {
        const app = getTestApp();

        const response = await request(app).delete(
            "/groups/some-group-id/users/some-user-id",
        );

        expect(response.status).toBe(401);
    });

    it("should return 403 when user does not have access to group", async () => {
        const app = getTestApp();
        const groupRepository = new DrizzleGroupRepository();

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

        await request(app).post("/users").send(owner);
        await request(app).post("/users").send(otherUser);

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
            .delete(
                `/groups/${group.id}/users/00000000-0000-0000-0000-000000000000`,
            )
            .set("Authorization", `Bearer ${otherToken}`);

        expect(response.status).toBe(403);
    });

    it("should return 403 when user is contributor", async () => {
        const app = getTestApp();
        const groupRepository = new DrizzleGroupRepository();

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

        await request(app).post("/users").send(owner);
        await request(app).post("/users").send(contributor);

        const ownerLogin = await request(app).post("/users/login").send({
            email: owner.email,
            password: owner.password,
        });

        const ownerId = ownerLogin.body.user.id;
        const group = await groupRepository.createGroup("Test Group", ownerId);

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
            .delete(
                `/groups/${group.id}/users/00000000-0000-0000-0000-000000000000`,
            )
            .set("Authorization", `Bearer ${contributorToken}`);

        expect(response.status).toBe(403);
    });

    it("should succeed even if user does not exist in group", async () => {
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
            .delete(
                `/groups/${group.id}/users/00000000-0000-0000-0000-000000000000`,
            )
            .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(204);

        const groupUsers = await groupRepository.findUsersByGroupId(group.id);
        expect(groupUsers.length).toBe(1);
        expect(groupUsers[0].userId).toBe(ownerId);
    });

    it("should only remove user from specified group", async () => {
        const app = getTestApp();
        const groupRepository = new DrizzleGroupRepository();
        const userRepository = new DrizzleUserRepository();

        const owner = {
            name: "Owner",
            surname: "User",
            email: `owner-${Date.now()}${Math.random()}@example.com`,
            password: "password123",
        };

        const userToRemove = {
            name: "User",
            surname: "ToRemove",
            email: `usertoremove-${Date.now()}${Math.random()}@example.com`,
            password: "password123",
        };

        await request(app).post("/users").send(owner);
        const createdUser = await userRepository.create(userToRemove);

        const loginResponse = await request(app).post("/users/login").send({
            email: owner.email,
            password: owner.password,
        });

        const token = loginResponse.body.token;
        const ownerId = loginResponse.body.user.id;

        const group1 = await groupRepository.createGroup("Group One", ownerId);
        const group2 = await groupRepository.createGroup("Group Two", ownerId);

        await groupRepository.addUserToGroup(
            createdUser.id,
            group1.id,
            UserGroupRole.Contributor,
        );

        await groupRepository.addUserToGroup(
            createdUser.id,
            group2.id,
            UserGroupRole.Contributor,
        );

        const response = await request(app)
            .delete(`/groups/${group1.id}/users/${createdUser.id}`)
            .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(204);

        const group1Users = await groupRepository.findUsersByGroupId(group1.id);
        const group2Users = await groupRepository.findUsersByGroupId(group2.id);

        expect(group1Users.length).toBe(1);
        expect(group1Users[0].userId).toBe(ownerId);

        expect(group2Users.length).toBe(2);
        expect(group2Users.map((u) => u.userId)).toContain(createdUser.id);
    });

    it("should allow owner to remove admin", async () => {
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

        await request(app).post("/users").send(owner);
        const createdAdmin = await userRepository.create(admin);

        const loginResponse = await request(app).post("/users/login").send({
            email: owner.email,
            password: owner.password,
        });

        const token = loginResponse.body.token;
        const ownerId = loginResponse.body.user.id;

        const group = await groupRepository.createGroup("Test Group", ownerId);

        await groupRepository.addUserToGroup(
            createdAdmin.id,
            group.id,
            UserGroupRole.Admin,
        );

        let groupUsers = await groupRepository.findUsersByGroupId(group.id);
        expect(groupUsers.length).toBe(2);

        const response = await request(app)
            .delete(`/groups/${group.id}/users/${createdAdmin.id}`)
            .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(204);

        groupUsers = await groupRepository.findUsersByGroupId(group.id);
        expect(groupUsers.length).toBe(1);
        expect(groupUsers[0].userId).toBe(ownerId);
    });
});
