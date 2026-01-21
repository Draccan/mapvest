import request from "supertest";

import { UserGroupRole } from "../../src/core/commons/enums";
import { DrizzleGroupRepository } from "../../src/dependency-implementations/DrizzleGroupRepository";
import { DrizzleMapRepository } from "../../src/dependency-implementations/DrizzleMapRepository";
import { getTestApp } from "./setup";

describe("Update Map Route", () => {
    it("PUT /:groupId/maps/:mapId should update a map name", async () => {
        const app = getTestApp();

        const uniqueUser = {
            name: "UpdateMaps",
            surname: "TestUser",
            email: `update-maps-test-${Date.now()}${Math.random()}@example.com`,
            password: "testpass123",
        };

        await request(app).post("/users").send(uniqueUser);

        const loginResponse = await request(app).post("/users/login").send({
            email: uniqueUser.email,
            password: uniqueUser.password,
        });

        const accessToken = loginResponse.body.token;
        const userId = loginResponse.body.user.id;

        const groupRepository = new DrizzleGroupRepository();
        const group = await groupRepository.createGroup("Test Group", userId);
        const groupId = group.id;

        const mapRepository = new DrizzleMapRepository();
        const map = await mapRepository.createMap(groupId, {
            name: "Original Map Name",
        });
        const mapId = map.id;

        const response = await request(app)
            .put(`/${groupId}/maps/${mapId}`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ name: "Updated Map Name" })
            .expect(200);

        expect(response.body).toHaveProperty("id");
        expect(response.body.id).toBe(mapId);
        expect(response.body.name).toBe("Updated Map Name");
        expect(response.body.isPublic).toBe(false);
        expect(response.body.publicId).toBeNull();
    });

    it("PUT /:groupId/maps/:mapId should return correct map structure", async () => {
        const app = getTestApp();

        const uniqueUser = {
            name: "UpdateMaps",
            surname: "TestUser",
            email: `update-maps-test-${Date.now()}${Math.random()}@example.com`,
            password: "testpass123",
        };

        await request(app).post("/users").send(uniqueUser);

        const loginResponse = await request(app).post("/users/login").send({
            email: uniqueUser.email,
            password: uniqueUser.password,
        });

        const accessToken = loginResponse.body.token;
        const userId = loginResponse.body.user.id;

        const groupRepository = new DrizzleGroupRepository();
        const group = await groupRepository.createGroup("Test Group", userId);
        const groupId = group.id;

        const mapRepository = new DrizzleMapRepository();
        const map = await mapRepository.createMap(groupId, {
            name: "Original Name",
        });
        const mapId = map.id;

        const response = await request(app)
            .put(`/${groupId}/maps/${mapId}`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ name: "New Name" })
            .expect(200);

        expect(response.body).toHaveProperty("id");
        expect(response.body).toHaveProperty("name");
        expect(response.body).toHaveProperty("isPublic");
        expect(response.body).toHaveProperty("publicId");
        expect(typeof response.body.id).toBe("string");
        expect(typeof response.body.name).toBe("string");
        expect(typeof response.body.isPublic).toBe("boolean");
        expect(response.body.name).toBe("New Name");
    });

    it("PUT /:groupId/maps/:mapId should return 401 without token", async () => {
        const app = getTestApp();

        const uniqueUser = {
            name: "UpdateMaps",
            surname: "TestUser",
            email: `update-maps-test-${Date.now()}${Math.random()}@example.com`,
            password: "testpass123",
        };

        await request(app).post("/users").send(uniqueUser);

        const loginResponse = await request(app).post("/users/login").send({
            email: uniqueUser.email,
            password: uniqueUser.password,
        });

        const userId = loginResponse.body.user.id;

        const groupRepository = new DrizzleGroupRepository();
        const group = await groupRepository.createGroup("Test Group", userId);
        const groupId = group.id;

        const mapRepository = new DrizzleMapRepository();
        const map = await mapRepository.createMap(groupId, {
            name: "Original Name",
        });
        const mapId = map.id;

        await request(app)
            .put(`/${groupId}/maps/${mapId}`)
            .send({ name: "New Name" })
            .expect(401);
    });

    it("PUT /:groupId/maps/:mapId should return 403 when user does not have access to group", async () => {
        const app = getTestApp();

        const user1 = {
            name: "UpdateMaps",
            surname: "User1",
            email: `update-maps-user1-${Date.now()}${Math.random()}@example.com`,
            password: "testpass123",
        };

        const user2 = {
            name: "UpdateMaps",
            surname: "User2",
            email: `update-maps-user2-${Date.now()}${Math.random()}@example.com`,
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

        const user1AccessToken = loginResponse1.body.token;
        const user1Id = loginResponse1.body.user.id;

        const user2AccessToken = loginResponse2.body.token;

        const groupRepository = new DrizzleGroupRepository();
        const group = await groupRepository.createGroup("User1 Group", user1Id);
        const groupId = group.id;

        const mapRepository = new DrizzleMapRepository();
        const map = await mapRepository.createMap(groupId, {
            name: "Original Name",
        });
        const mapId = map.id;

        await request(app)
            .put(`/${groupId}/maps/${mapId}`)
            .set("Authorization", `Bearer ${user2AccessToken}`)
            .send({ name: "New Name" })
            .expect(403);

        const verifyResponse = await request(app)
            .get(`/${groupId}/maps`)
            .set("Authorization", `Bearer ${user1AccessToken}`)
            .expect(200);

        const unchangedMap = verifyResponse.body.find(
            (m: any) => m.id === mapId,
        );
        expect(unchangedMap.name).toBe("Original Name");
    });

    it("PUT /:groupId/maps/:mapId should return 403 when map does not belong to group", async () => {
        const app = getTestApp();

        const uniqueUser = {
            name: "UpdateMaps",
            surname: "TestUser",
            email: `update-maps-test-${Date.now()}${Math.random()}@example.com`,
            password: "testpass123",
        };

        await request(app).post("/users").send(uniqueUser);

        const loginResponse = await request(app).post("/users/login").send({
            email: uniqueUser.email,
            password: uniqueUser.password,
        });

        const accessToken = loginResponse.body.token;
        const userId = loginResponse.body.user.id;

        const groupRepository = new DrizzleGroupRepository();
        const group1 = await groupRepository.createGroup(
            "Test Group 1",
            userId,
        );
        const group2 = await groupRepository.createGroup(
            "Test Group 2",
            userId,
        );

        const mapRepository = new DrizzleMapRepository();
        const map = await mapRepository.createMap(group1.id, {
            name: "Original Name",
        });

        await request(app)
            .put(`/${group2.id}/maps/${map.id}`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ name: "New Name" })
            .expect(403);
    });

    it("PUT /:groupId/maps/:mapId should return 403 for non-existent map", async () => {
        const app = getTestApp();

        const uniqueUser = {
            name: "UpdateMaps",
            surname: "TestUser",
            email: `update-maps-test-${Date.now()}${Math.random()}@example.com`,
            password: "testpass123",
        };

        await request(app).post("/users").send(uniqueUser);

        const loginResponse = await request(app).post("/users/login").send({
            email: uniqueUser.email,
            password: uniqueUser.password,
        });

        const accessToken = loginResponse.body.token;
        const userId = loginResponse.body.user.id;

        const groupRepository = new DrizzleGroupRepository();
        const group = await groupRepository.createGroup("Test Group", userId);

        await request(app)
            .put(`/${group.id}/maps/non-existent-map-id`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ name: "New Name" })
            .expect(403);
    });

    it("PUT /:groupId/maps/:mapId should succeed with empty payload", async () => {
        const app = getTestApp();

        const uniqueUser = {
            name: "UpdateMaps",
            surname: "TestUser",
            email: `update-maps-test-${Date.now()}${Math.random()}@example.com`,
            password: "testpass123",
        };

        await request(app).post("/users").send(uniqueUser);

        const loginResponse = await request(app).post("/users/login").send({
            email: uniqueUser.email,
            password: uniqueUser.password,
        });

        const accessToken = loginResponse.body.token;
        const userId = loginResponse.body.user.id;

        const groupRepository = new DrizzleGroupRepository();
        const group = await groupRepository.createGroup("Test Group", userId);
        const groupId = group.id;

        const mapRepository = new DrizzleMapRepository();
        const map = await mapRepository.createMap(groupId, {
            name: "Original Name",
        });
        const mapId = map.id;

        const response = await request(app)
            .put(`/${groupId}/maps/${mapId}`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({})
            .expect(200);

        expect(response.body.name).toBe("Original Name");
        expect(response.body.isPublic).toBe(false);
        expect(response.body.publicId).toBeNull();
    });

    it("PUT /:groupId/maps/:mapId should set isPublic to true as owner", async () => {
        const app = getTestApp();

        const uniqueUser = {
            name: "UpdateMaps",
            surname: "TestUser",
            email: `update-maps-test-${Date.now()}${Math.random()}@example.com`,
            password: "testpass123",
        };

        await request(app).post("/users").send(uniqueUser);

        const loginResponse = await request(app).post("/users/login").send({
            email: uniqueUser.email,
            password: uniqueUser.password,
        });

        const accessToken = loginResponse.body.token;
        const userId = loginResponse.body.user.id;

        const groupRepository = new DrizzleGroupRepository();
        const group = await groupRepository.createGroup("Test Group", userId);
        const groupId = group.id;

        const mapRepository = new DrizzleMapRepository();
        const map = await mapRepository.createMap(groupId, {
            name: "Test Map",
        });
        const mapId = map.id;

        const response = await request(app)
            .put(`/${groupId}/maps/${mapId}`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ isPublic: true })
            .expect(200);

        expect(response.body.isPublic).toBe(true);
        expect(response.body.publicId).toBeDefined();
        expect(typeof response.body.publicId).toBe("string");
    });

    it("PUT /:groupId/maps/:mapId should set isPublic to true as admin", async () => {
        const app = getTestApp();

        const owner = {
            name: "Owner",
            surname: "User",
            email: `owner-${Date.now()}${Math.random()}@example.com`,
            password: "testpass123",
        };

        const admin = {
            name: "Admin",
            surname: "User",
            email: `admin-${Date.now()}${Math.random()}@example.com`,
            password: "testpass123",
        };

        await request(app).post("/users").send(owner);
        await request(app).post("/users").send(admin);

        const ownerLoginResponse = await request(app)
            .post("/users/login")
            .send({
                email: owner.email,
                password: owner.password,
            });

        const adminLoginResponse = await request(app)
            .post("/users/login")
            .send({
                email: admin.email,
                password: admin.password,
            });

        const ownerId = ownerLoginResponse.body.user.id;
        const adminAccessToken = adminLoginResponse.body.token;
        const adminId = adminLoginResponse.body.user.id;

        const groupRepository = new DrizzleGroupRepository();
        const group = await groupRepository.createGroup("Test Group", ownerId);
        const groupId = group.id;

        await groupRepository.addUserToGroup(
            adminId,
            groupId,
            UserGroupRole.Admin,
        );

        const mapRepository = new DrizzleMapRepository();
        const map = await mapRepository.createMap(groupId, {
            name: "Test Map",
        });
        const mapId = map.id;

        const response = await request(app)
            .put(`/${groupId}/maps/${mapId}`)
            .set("Authorization", `Bearer ${adminAccessToken}`)
            .send({ isPublic: true })
            .expect(200);

        expect(response.body.isPublic).toBe(true);
        expect(response.body.publicId).toBeDefined();
        expect(typeof response.body.publicId).toBe("string");
    });

    it("PUT /:groupId/maps/:mapId should return 403 when contributor tries to set isPublic", async () => {
        const app = getTestApp();

        const owner = {
            name: "Owner",
            surname: "User",
            email: `owner-${Date.now()}${Math.random()}@example.com`,
            password: "testpass123",
        };

        const contributor = {
            name: "Contributor",
            surname: "User",
            email: `contributor-${Date.now()}${Math.random()}@example.com`,
            password: "testpass123",
        };

        await request(app).post("/users").send(owner);
        await request(app).post("/users").send(contributor);

        const ownerLoginResponse = await request(app)
            .post("/users/login")
            .send({
                email: owner.email,
                password: owner.password,
            });

        const contributorLoginResponse = await request(app)
            .post("/users/login")
            .send({
                email: contributor.email,
                password: contributor.password,
            });

        const ownerId = ownerLoginResponse.body.user.id;
        const contributorAccessToken = contributorLoginResponse.body.token;
        const contributorId = contributorLoginResponse.body.user.id;

        const groupRepository = new DrizzleGroupRepository();
        const group = await groupRepository.createGroup("Test Group", ownerId);
        const groupId = group.id;

        await groupRepository.addUserToGroup(
            contributorId,
            groupId,
            UserGroupRole.Contributor,
        );

        const mapRepository = new DrizzleMapRepository();
        const map = await mapRepository.createMap(groupId, {
            name: "Test Map",
        });
        const mapId = map.id;

        await request(app)
            .put(`/${groupId}/maps/${mapId}`)
            .set("Authorization", `Bearer ${contributorAccessToken}`)
            .send({ isPublic: true })
            .expect(403);

        const maps = await mapRepository.findMapByGroupId(groupId);
        const unchangedMap = maps.find((m) => m.id === mapId);
        expect(unchangedMap?.isPublic).toBe(false);
    });

    it("PUT /:groupId/maps/:mapId should allow contributor to update name only", async () => {
        const app = getTestApp();

        const owner = {
            name: "Owner",
            surname: "User",
            email: `owner-${Date.now()}${Math.random()}@example.com`,
            password: "testpass123",
        };

        const contributor = {
            name: "Contributor",
            surname: "User",
            email: `contributor-${Date.now()}${Math.random()}@example.com`,
            password: "testpass123",
        };

        await request(app).post("/users").send(owner);
        await request(app).post("/users").send(contributor);

        const ownerLoginResponse = await request(app)
            .post("/users/login")
            .send({
                email: owner.email,
                password: owner.password,
            });

        const contributorLoginResponse = await request(app)
            .post("/users/login")
            .send({
                email: contributor.email,
                password: contributor.password,
            });

        const ownerId = ownerLoginResponse.body.user.id;
        const contributorAccessToken = contributorLoginResponse.body.token;
        const contributorId = contributorLoginResponse.body.user.id;

        const groupRepository = new DrizzleGroupRepository();
        const group = await groupRepository.createGroup("Test Group", ownerId);
        const groupId = group.id;

        await groupRepository.addUserToGroup(
            contributorId,
            groupId,
            UserGroupRole.Contributor,
        );

        const mapRepository = new DrizzleMapRepository();
        const map = await mapRepository.createMap(groupId, {
            name: "Original Name",
        });
        const mapId = map.id;

        const response = await request(app)
            .put(`/${groupId}/maps/${mapId}`)
            .set("Authorization", `Bearer ${contributorAccessToken}`)
            .send({ name: "Updated Name" })
            .expect(200);

        expect(response.body.name).toBe("Updated Name");
        expect(response.body.isPublic).toBe(false);
    });

    it("PUT /:groupId/maps/:mapId should set isPublic to false and remove publicId", async () => {
        const app = getTestApp();

        const uniqueUser = {
            name: "UpdateMaps",
            surname: "TestUser",
            email: `update-maps-test-${Date.now()}${Math.random()}@example.com`,
            password: "testpass123",
        };

        await request(app).post("/users").send(uniqueUser);

        const loginResponse = await request(app).post("/users/login").send({
            email: uniqueUser.email,
            password: uniqueUser.password,
        });

        const accessToken = loginResponse.body.token;
        const userId = loginResponse.body.user.id;

        const groupRepository = new DrizzleGroupRepository();
        const group = await groupRepository.createGroup("Test Group", userId);
        const groupId = group.id;

        const mapRepository = new DrizzleMapRepository();
        const map = await mapRepository.createMap(groupId, {
            name: "Test Map",
        });
        const mapId = map.id;

        await request(app)
            .put(`/${groupId}/maps/${mapId}`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ isPublic: true })
            .expect(200);

        const response = await request(app)
            .put(`/${groupId}/maps/${mapId}`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ isPublic: false })
            .expect(200);

        expect(response.body.isPublic).toBe(false);
        expect(response.body.publicId).toBeNull();
    });

    it("PUT /:groupId/maps/:mapId should update name and isPublic together", async () => {
        const app = getTestApp();

        const uniqueUser = {
            name: "UpdateMaps",
            surname: "TestUser",
            email: `update-maps-test-${Date.now()}${Math.random()}@example.com`,
            password: "testpass123",
        };

        await request(app).post("/users").send(uniqueUser);

        const loginResponse = await request(app).post("/users/login").send({
            email: uniqueUser.email,
            password: uniqueUser.password,
        });

        const accessToken = loginResponse.body.token;
        const userId = loginResponse.body.user.id;

        const groupRepository = new DrizzleGroupRepository();
        const group = await groupRepository.createGroup("Test Group", userId);
        const groupId = group.id;

        const mapRepository = new DrizzleMapRepository();
        const map = await mapRepository.createMap(groupId, {
            name: "Original Name",
        });
        const mapId = map.id;

        const response = await request(app)
            .put(`/${groupId}/maps/${mapId}`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ name: "New Name", isPublic: true })
            .expect(200);

        expect(response.body.name).toBe("New Name");
        expect(response.body.isPublic).toBe(true);
        expect(response.body.publicId).toBeDefined();
    });
});
