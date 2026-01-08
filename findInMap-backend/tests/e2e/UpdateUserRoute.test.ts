import request from "supertest";

import { getTestApp } from "./setup";
import { testUser } from "../helpers";

describe("Update User Password Route", () => {
    let app: any;

    beforeAll(() => {
        app = getTestApp();
    });

    it("PUT /users/:userId should successfully update user password", async () => {
        const uniqueUser = {
            ...testUser,
            email: `update-password-${Date.now()}@example.com`,
        };

        const createResponse = await request(app)
            .post("/users")
            .send(uniqueUser)
            .expect(201);

        const userId = createResponse.body.id;

        const loginResponse = await request(app)
            .post("/users/login")
            .send({
                email: uniqueUser.email,
                password: uniqueUser.password,
            })
            .expect(200);

        const accessToken = loginResponse.body.token;

        const newPassword = "newSecurePass123";

        await request(app)
            .put(`/users/${userId}`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({
                currentPassword: uniqueUser.password,
                newPassword: newPassword,
            })
            .expect(204);

        await request(app)
            .post("/users/login")
            .send({
                email: uniqueUser.email,
                password: uniqueUser.password,
            })
            .expect(401);

        await request(app)
            .post("/users/login")
            .send({
                email: uniqueUser.email,
                password: newPassword,
            })
            .expect(200);
    });

    it("PUT /users/:userId should return 403 when current password is incorrect", async () => {
        const uniqueUser = {
            ...testUser,
            email: `wrong-password-${Date.now()}@example.com`,
        };

        const createResponse = await request(app)
            .post("/users")
            .send(uniqueUser)
            .expect(201);

        const userId = createResponse.body.id;

        const loginResponse = await request(app)
            .post("/users/login")
            .send({
                email: uniqueUser.email,
                password: uniqueUser.password,
            })
            .expect(200);

        const accessToken = loginResponse.body.token;

        await request(app)
            .put(`/users/${userId}`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({
                currentPassword: "wrongPassword123",
                newPassword: "newSecurePass123",
            })
            .expect(403);
    });

    it("PUT /users/:userId should return 400 when new password is too short", async () => {
        const uniqueUser = {
            ...testUser,
            email: `short-password-${Date.now()}@example.com`,
        };

        const createResponse = await request(app)
            .post("/users")
            .send(uniqueUser)
            .expect(201);

        const userId = createResponse.body.id;

        const loginResponse = await request(app)
            .post("/users/login")
            .send({
                email: uniqueUser.email,
                password: uniqueUser.password,
            })
            .expect(200);

        const accessToken = loginResponse.body.token;

        await request(app)
            .put(`/users/${userId}`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({
                currentPassword: uniqueUser.password,
                newPassword: "short",
            })
            .expect(400);
    });

    it("PUT /users/:userId should return 400 when new password is too long", async () => {
        const uniqueUser = {
            ...testUser,
            email: `long-password-${Date.now()}@example.com`,
        };

        const createResponse = await request(app)
            .post("/users")
            .send(uniqueUser)
            .expect(201);

        const userId = createResponse.body.id;

        const loginResponse = await request(app)
            .post("/users/login")
            .send({
                email: uniqueUser.email,
                password: uniqueUser.password,
            })
            .expect(200);

        const accessToken = loginResponse.body.token;

        await request(app)
            .put(`/users/${userId}`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({
                currentPassword: uniqueUser.password,
                newPassword: "a".repeat(21),
            })
            .expect(400);
    });

    it("PUT /users/:userId should return 401 when no authorization header is provided", async () => {
        const uniqueUser = {
            ...testUser,
            email: `no-auth-${Date.now()}@example.com`,
        };

        const createResponse = await request(app)
            .post("/users")
            .send(uniqueUser)
            .expect(201);

        const userId = createResponse.body.id;

        await request(app)
            .put(`/users/${userId}`)
            .send({
                currentPassword: uniqueUser.password,
                newPassword: "newSecurePass123",
            })
            .expect(401);
    });

    it("PUT /users/:userId should handle special characters in passwords", async () => {
        const uniqueUser = {
            ...testUser,
            email: `special-chars-${Date.now()}@example.com`,
            password: "oldP@ss!123",
        };

        const createResponse = await request(app)
            .post("/users")
            .send(uniqueUser)
            .expect(201);

        const userId = createResponse.body.id;

        const loginResponse = await request(app)
            .post("/users/login")
            .send({
                email: uniqueUser.email,
                password: uniqueUser.password,
            })
            .expect(200);

        const accessToken = loginResponse.body.token;
        const newPassword = "n3wP@ss!@#$%";

        await request(app)
            .put(`/users/${userId}`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({
                currentPassword: uniqueUser.password,
                newPassword: newPassword,
            })
            .expect(204);

        await request(app)
            .post("/users/login")
            .send({
                email: uniqueUser.email,
                password: newPassword,
            })
            .expect(200);
    });
});
