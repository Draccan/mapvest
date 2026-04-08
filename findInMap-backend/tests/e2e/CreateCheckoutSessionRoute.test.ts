import request from "supertest";
import { DrizzleGroupRepository } from "../../src/dependency-implementations/DrizzleGroupRepository";
import { getTestApp } from "./setup";

describe("POST /payments/checkout-session", () => {
    it("should return 401 when not authenticated", async () => {
        const app = getTestApp();

        const response = await request(app)
            .post("/payments/checkout-session")
            .send({ groupId: "some-group-id" });

        expect(response.status).toBe(401);
    });

    it("should return 403 when user has no access to the group", async () => {
        const app = getTestApp();
        const groupRepository = new DrizzleGroupRepository();

        // Create owner and their group
        const ownerUser = {
            name: "Owner",
            surname: "User",
            email: `owner-noaccess-${Date.now()}${Math.random()}@example.com`,
            password: "password123",
        };

        await request(app).post("/users").send(ownerUser);

        const ownerLogin = await request(app).post("/users/login").send({
            email: ownerUser.email,
            password: ownerUser.password,
        });

        const ownerId = ownerLogin.body.user.id;
        const group = await groupRepository.createGroup(
            "Private Group",
            ownerId,
        );

        // Create unrelated user
        const otherUser = {
            name: "Other",
            surname: "User",
            email: `other-noaccess-${Date.now()}${Math.random()}@example.com`,
            password: "password123",
        };

        await request(app).post("/users").send(otherUser);

        const otherLogin = await request(app).post("/users/login").send({
            email: otherUser.email,
            password: otherUser.password,
        });

        const otherToken = otherLogin.body.token;

        const response = await request(app)
            .post("/payments/checkout-session")
            .set("Authorization", `Bearer ${otherToken}`)
            .send({ groupId: group.id });

        expect(response.status).toBe(403);
    });

    it("should return 400 when groupId is missing", async () => {
        const app = getTestApp();

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

        const response = await request(app)
            .post("/payments/checkout-session")
            .set("Authorization", `Bearer ${token}`)
            .send({});

        expect(response.status).toBe(400);
    });
});
