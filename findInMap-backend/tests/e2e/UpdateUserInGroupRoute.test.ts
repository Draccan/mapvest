import request from "supertest";
import { UserGroupRole } from "../../src/core/commons/enums";
import { DrizzleGroupRepository } from "../../src/dependency-implementations/DrizzleGroupRepository";
import { DrizzleUserRepository } from "../../src/dependency-implementations/DrizzleUserRepository";
import { getTestApp } from "./setup";

describe("PUT /groups/:groupId/users/:userId", () => {
    it("should allow owner to change contributor role to admin", async () => {
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

        await request(app).post("/users").send(owner);
        const createdContributor = await userRepository.create(contributor);

        const ownerLogin = await request(app).post("/users/login").send({
            email: owner.email,
            password: owner.password,
        });

        const ownerId = ownerLogin.body.user.id;
        const ownerToken = ownerLogin.body.token;

        const group = await groupRepository.createGroup("Test Group", ownerId);
        await groupRepository.addUserToGroup(
            createdContributor.id,
            group.id,
            UserGroupRole.Contributor,
        );

        const response = await request(app)
            .put(`/groups/${group.id}/users/${createdContributor.id}`)
            .set("Authorization", `Bearer ${ownerToken}`)
            .send({
                role: UserGroupRole.Admin,
            });

        expect(response.status).toBe(204);

        const groupUsers = await groupRepository.findUsersByGroupId(group.id);
        const updatedUser = groupUsers.find(
            (u) => u.userId === createdContributor.id,
        );
        expect(updatedUser?.role).toBe(UserGroupRole.Admin);
    });

    it("should allow owner to change admin role to contributor", async () => {
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

        const ownerLogin = await request(app).post("/users/login").send({
            email: owner.email,
            password: owner.password,
        });

        const ownerId = ownerLogin.body.user.id;
        const ownerToken = ownerLogin.body.token;

        const group = await groupRepository.createGroup("Test Group", ownerId);
        await groupRepository.addUserToGroup(
            createdAdmin.id,
            group.id,
            UserGroupRole.Admin,
        );

        const response = await request(app)
            .put(`/groups/${group.id}/users/${createdAdmin.id}`)
            .set("Authorization", `Bearer ${ownerToken}`)
            .send({
                role: UserGroupRole.Contributor,
            });

        expect(response.status).toBe(204);

        const groupUsers = await groupRepository.findUsersByGroupId(group.id);
        const updatedUser = groupUsers.find(
            (u) => u.userId === createdAdmin.id,
        );
        expect(updatedUser?.role).toBe(UserGroupRole.Contributor);
    });

    it("should allow admin to change contributor role to admin", async () => {
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

        const contributor = {
            name: "Contributor",
            surname: "User",
            email: `contributor-${Date.now()}${Math.random()}@example.com`,
            password: "password123",
        };

        await request(app).post("/users").send(owner);
        await request(app).post("/users").send(admin);
        await request(app).post("/users").send(contributor);

        const ownerLogin = await request(app).post("/users/login").send({
            email: owner.email,
            password: owner.password,
        });

        const ownerId = ownerLogin.body.user.id;

        const adminLogin = await request(app).post("/users/login").send({
            email: admin.email,
            password: admin.password,
        });

        const adminId = adminLogin.body.user.id;
        const adminToken = adminLogin.body.token;

        const contributorLogin = await request(app).post("/users/login").send({
            email: contributor.email,
            password: contributor.password,
        });

        const contributorId = contributorLogin.body.user.id;

        const group = await groupRepository.createGroup("Test Group", ownerId);
        await groupRepository.addUserToGroup(
            adminId,
            group.id,
            UserGroupRole.Admin,
        );
        await groupRepository.addUserToGroup(
            contributorId,
            group.id,
            UserGroupRole.Contributor,
        );

        const response = await request(app)
            .put(`/groups/${group.id}/users/${contributorId}`)
            .set("Authorization", `Bearer ${adminToken}`)
            .send({
                role: UserGroupRole.Admin,
            });

        expect(response.status).toBe(204);

        const groupUsers = await groupRepository.findUsersByGroupId(group.id);
        const updatedUser = groupUsers.find((u) => u.userId === contributorId);
        expect(updatedUser?.role).toBe(UserGroupRole.Admin);
    });

    it("should allow admin to change admin role to contributor", async () => {
        const app = getTestApp();
        const groupRepository = new DrizzleGroupRepository();
        const userRepository = new DrizzleUserRepository();

        const owner = {
            name: "Owner",
            surname: "User",
            email: `owner-${Date.now()}${Math.random()}@example.com`,
            password: "password123",
        };

        const admin1 = {
            name: "Admin1",
            surname: "User",
            email: `admin1-${Date.now()}${Math.random()}@example.com`,
            password: "password123",
        };

        const admin2 = {
            name: "Admin2",
            surname: "User",
            email: `admin2-${Date.now()}${Math.random()}@example.com`,
            password: "password123",
        };

        await request(app).post("/users").send(owner);
        await request(app).post("/users").send(admin1);
        await request(app).post("/users").send(admin2);

        const ownerLogin = await request(app).post("/users/login").send({
            email: owner.email,
            password: owner.password,
        });

        const ownerId = ownerLogin.body.user.id;

        const admin1Login = await request(app).post("/users/login").send({
            email: admin1.email,
            password: admin1.password,
        });

        const admin1Id = admin1Login.body.user.id;
        const admin1Token = admin1Login.body.token;

        const admin2Login = await request(app).post("/users/login").send({
            email: admin2.email,
            password: admin2.password,
        });

        const admin2Id = admin2Login.body.user.id;

        const group = await groupRepository.createGroup("Test Group", ownerId);
        await groupRepository.addUserToGroup(
            admin1Id,
            group.id,
            UserGroupRole.Admin,
        );
        await groupRepository.addUserToGroup(
            admin2Id,
            group.id,
            UserGroupRole.Admin,
        );

        const response = await request(app)
            .put(`/groups/${group.id}/users/${admin2Id}`)
            .set("Authorization", `Bearer ${admin1Token}`)
            .send({
                role: UserGroupRole.Contributor,
            });

        expect(response.status).toBe(204);

        const groupUsers = await groupRepository.findUsersByGroupId(group.id);
        const updatedUser = groupUsers.find((u) => u.userId === admin2Id);
        expect(updatedUser?.role).toBe(UserGroupRole.Contributor);
    });

    it("should return 403 when admin tries to change owner role", async () => {
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
        await request(app).post("/users").send(admin);

        const ownerLogin = await request(app).post("/users/login").send({
            email: owner.email,
            password: owner.password,
        });

        const ownerId = ownerLogin.body.user.id;

        const adminLogin = await request(app).post("/users/login").send({
            email: admin.email,
            password: admin.password,
        });

        const adminId = adminLogin.body.user.id;
        const adminToken = adminLogin.body.token;

        const group = await groupRepository.createGroup("Test Group", ownerId);
        await groupRepository.addUserToGroup(
            adminId,
            group.id,
            UserGroupRole.Admin,
        );

        const response = await request(app)
            .put(`/groups/${group.id}/users/${ownerId}`)
            .set("Authorization", `Bearer ${adminToken}`)
            .send({
                role: UserGroupRole.Contributor,
            });

        expect(response.status).toBe(403);
        expect(response.body.error).toContain("Cannot change the role");
    });

    it("should return 403 when contributor tries to change user role", async () => {
        const app = getTestApp();
        const groupRepository = new DrizzleGroupRepository();
        const userRepository = new DrizzleUserRepository();

        const owner = {
            name: "Owner",
            surname: "User",
            email: `owner-${Date.now()}${Math.random()}@example.com`,
            password: "password123",
        };

        const contributor1 = {
            name: "Contributor1",
            surname: "User",
            email: `contributor1-${Date.now()}${Math.random()}@example.com`,
            password: "password123",
        };

        const contributor2 = {
            name: "Contributor2",
            surname: "User",
            email: `contributor2-${Date.now()}${Math.random()}@example.com`,
            password: "password123",
        };

        await request(app).post("/users").send(owner);
        await request(app).post("/users").send(contributor1);
        await request(app).post("/users").send(contributor2);

        const ownerLogin = await request(app).post("/users/login").send({
            email: owner.email,
            password: owner.password,
        });

        const ownerId = ownerLogin.body.user.id;

        const contributor1Login = await request(app).post("/users/login").send({
            email: contributor1.email,
            password: contributor1.password,
        });

        const contributor1Id = contributor1Login.body.user.id;
        const contributor1Token = contributor1Login.body.token;

        const contributor2Login = await request(app).post("/users/login").send({
            email: contributor2.email,
            password: contributor2.password,
        });

        const contributor2Id = contributor2Login.body.user.id;

        const group = await groupRepository.createGroup("Test Group", ownerId);
        await groupRepository.addUserToGroup(
            contributor1Id,
            group.id,
            UserGroupRole.Contributor,
        );
        await groupRepository.addUserToGroup(
            contributor2Id,
            group.id,
            UserGroupRole.Contributor,
        );

        const response = await request(app)
            .put(`/groups/${group.id}/users/${contributor2Id}`)
            .set("Authorization", `Bearer ${contributor1Token}`)
            .send({
                role: UserGroupRole.Admin,
            });

        expect(response.status).toBe(403);
        expect(response.body.error).toContain("must be owner or admin");
    });

    it("should return 403 when owner tries to change their own role", async () => {
        const app = getTestApp();
        const groupRepository = new DrizzleGroupRepository();

        const owner = {
            name: "Owner",
            surname: "User",
            email: `owner-${Date.now()}${Math.random()}@example.com`,
            password: "password123",
        };

        await request(app).post("/users").send(owner);

        const ownerLogin = await request(app).post("/users/login").send({
            email: owner.email,
            password: owner.password,
        });

        const ownerId = ownerLogin.body.user.id;
        const ownerToken = ownerLogin.body.token;

        const group = await groupRepository.createGroup("Test Group", ownerId);

        const response = await request(app)
            .put(`/groups/${group.id}/users/${ownerId}`)
            .set("Authorization", `Bearer ${ownerToken}`)
            .send({
                role: UserGroupRole.Admin,
            });

        expect(response.status).toBe(403);
        expect(response.body.error).toContain(
            "Cannot change the role of the group owner",
        );
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

        const outsider = {
            name: "Outsider",
            surname: "User",
            email: `outsider-${Date.now()}${Math.random()}@example.com`,
            password: "password123",
        };

        const contributor = {
            name: "Contributor",
            surname: "User",
            email: `contributor-${Date.now()}${Math.random()}@example.com`,
            password: "password123",
        };

        await request(app).post("/users").send(owner);
        await request(app).post("/users").send(outsider);
        const createdContributor = await userRepository.create(contributor);

        const ownerLogin = await request(app).post("/users/login").send({
            email: owner.email,
            password: owner.password,
        });

        const ownerId = ownerLogin.body.user.id;

        const group = await groupRepository.createGroup("Test Group", ownerId);
        await groupRepository.addUserToGroup(
            createdContributor.id,
            group.id,
            UserGroupRole.Contributor,
        );

        const outsiderLogin = await request(app).post("/users/login").send({
            email: outsider.email,
            password: outsider.password,
        });

        const outsiderToken = outsiderLogin.body.token;

        const response = await request(app)
            .put(`/groups/${group.id}/users/${createdContributor.id}`)
            .set("Authorization", `Bearer ${outsiderToken}`)
            .send({
                role: UserGroupRole.Admin,
            });

        expect(response.status).toBe(403);
        expect(response.body.error).toContain("cannot access this group");
    });

    it("should return 403 when target user is not in the group", async () => {
        const app = getTestApp();
        const groupRepository = new DrizzleGroupRepository();
        const userRepository = new DrizzleUserRepository();

        const owner = {
            name: "Owner",
            surname: "User",
            email: `owner-${Date.now()}${Math.random()}@example.com`,
            password: "password123",
        };

        const outsider = {
            name: "Outsider",
            surname: "User",
            email: `outsider-${Date.now()}${Math.random()}@example.com`,
            password: "password123",
        };

        await request(app).post("/users").send(owner);
        const createdOutsider = await userRepository.create(outsider);

        const ownerLogin = await request(app).post("/users/login").send({
            email: owner.email,
            password: owner.password,
        });

        const ownerId = ownerLogin.body.user.id;
        const ownerToken = ownerLogin.body.token;

        const group = await groupRepository.createGroup("Test Group", ownerId);

        const response = await request(app)
            .put(`/groups/${group.id}/users/${createdOutsider.id}`)
            .set("Authorization", `Bearer ${ownerToken}`)
            .send({
                role: UserGroupRole.Admin,
            });

        expect(response.status).toBe(403);
        expect(response.body.error).toContain("not in the group");
    });

    it("should return 401 when not authenticated", async () => {
        const app = getTestApp();

        const response = await request(app)
            .put("/groups/some-group-id/users/some-user-id")
            .send({
                role: UserGroupRole.Admin,
            });

        expect(response.status).toBe(401);
    });

    it("should return 400 when role is invalid", async () => {
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

        await request(app).post("/users").send(owner);
        const createdContributor = await userRepository.create(contributor);

        const ownerLogin = await request(app).post("/users/login").send({
            email: owner.email,
            password: owner.password,
        });

        const ownerId = ownerLogin.body.user.id;
        const ownerToken = ownerLogin.body.token;

        const group = await groupRepository.createGroup("Test Group", ownerId);
        await groupRepository.addUserToGroup(
            createdContributor.id,
            group.id,
            UserGroupRole.Contributor,
        );

        const response = await request(app)
            .put(`/groups/${group.id}/users/${createdContributor.id}`)
            .set("Authorization", `Bearer ${ownerToken}`)
            .send({
                role: "invalid_role",
            });

        expect(response.status).toBe(400);
    });

    it("should return 400 when trying to set owner role", async () => {
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

        await request(app).post("/users").send(owner);
        const createdContributor = await userRepository.create(contributor);

        const ownerLogin = await request(app).post("/users/login").send({
            email: owner.email,
            password: owner.password,
        });

        const ownerId = ownerLogin.body.user.id;
        const ownerToken = ownerLogin.body.token;

        const group = await groupRepository.createGroup("Test Group", ownerId);
        await groupRepository.addUserToGroup(
            createdContributor.id,
            group.id,
            UserGroupRole.Contributor,
        );

        const response = await request(app)
            .put(`/groups/${group.id}/users/${createdContributor.id}`)
            .set("Authorization", `Bearer ${ownerToken}`)
            .send({
                role: UserGroupRole.Owner,
            });

        expect(response.status).toBe(400);
    });
});
