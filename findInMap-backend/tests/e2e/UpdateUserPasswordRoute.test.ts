import request from "supertest";

import { testUser, getMockEmailService } from "../helpers";
import { getTestApp } from "./setup";

describe("Update User Password Route", () => {
    let app: any;
    let mockEmailService: any;

    beforeAll(() => {
        app = getTestApp();
        mockEmailService = getMockEmailService();
    });

    beforeEach(() => {
        mockEmailService.clearSentEmails();
    });

    it("PUT /users/password should update password with valid reset token", async () => {
        const uniqueUser = {
            ...testUser,
            email: `update-pwd-${Date.now()}@example.com`,
        };

        await request(app).post("/users").send(uniqueUser).expect(201);

        await request(app)
            .post("/users/resetPassword")
            .send({ email: uniqueUser.email })
            .expect(200);

        expect(mockEmailService.sentEmails).toHaveLength(1);

        const emailBody = mockEmailService.sentEmails[0].html;
        const tokenMatch = emailBody.match(/token=([a-f0-9]+)/);
        expect(tokenMatch).toBeTruthy();

        const resetToken = tokenMatch[1];
        const newPassword = "NewPassword123";

        await request(app)
            .put("/users/password")
            .send({ resetToken, password: newPassword })
            .expect(204);

        const loginResponse = await request(app)
            .post("/users/login")
            .send({ email: uniqueUser.email, password: newPassword })
            .expect(200);

        expect(loginResponse.body).toHaveProperty("token");
        expect(loginResponse.body).toHaveProperty("user");
    });

    it("PUT /users/password should fail with invalid reset token", async () => {
        const response = await request(app)
            .put("/users/password")
            .send({ resetToken: "invalid-token", password: "NewPassword123" })
            .expect(401);

        expect(response.body).toHaveProperty("error");
    });

    it("PUT /users/password should validate password length (min 8 chars)", async () => {
        const response = await request(app)
            .put("/users/password")
            .send({ resetToken: "some-token", password: "short" })
            .expect(400);

        expect(response.body).toHaveProperty("name", "InvalidRequestError");
    });

    it("PUT /users/password should validate password length (max 20 chars)", async () => {
        const response = await request(app)
            .put("/users/password")
            .send({
                resetToken: "some-token",
                password: "ThisPasswordIsTooLongForValidation",
            })
            .expect(400);

        expect(response.body).toHaveProperty("name", "InvalidRequestError");
    });

    it("PUT /users/password should require both resetToken and password", async () => {
        const response1 = await request(app)
            .put("/users/password")
            .send({ resetToken: "some-token" })
            .expect(400);

        expect(response1.body).toHaveProperty("name", "InvalidRequestError");

        const response2 = await request(app)
            .put("/users/password")
            .send({ password: "NewPassword123" })
            .expect(400);

        expect(response2.body).toHaveProperty("name", "InvalidRequestError");
    });

    it("PUT /users/password should delete token after successful password update", async () => {
        const uniqueUser = {
            ...testUser,
            email: `delete-token-${Date.now()}@example.com`,
        };

        await request(app).post("/users").send(uniqueUser).expect(201);

        await request(app)
            .post("/users/resetPassword")
            .send({ email: uniqueUser.email })
            .expect(200);

        const emailBody = mockEmailService.sentEmails[0].html;
        const tokenMatch = emailBody.match(/token=([a-f0-9]+)/);
        const resetToken = tokenMatch[1];

        await request(app)
            .put("/users/password")
            .send({ resetToken, password: "NewPassword123" })
            .expect(204);

        const response = await request(app)
            .put("/users/password")
            .send({ resetToken, password: "AnotherPassword456" })
            .expect(401);

        expect(response.body).toHaveProperty("error");
    });

    it("PUT /users/password should not allow old password after reset", async () => {
        const uniqueUser = {
            ...testUser,
            email: `old-pwd-${Date.now()}@example.com`,
        };
        const oldPassword = uniqueUser.password;

        await request(app).post("/users").send(uniqueUser).expect(201);

        await request(app)
            .post("/users/resetPassword")
            .send({ email: uniqueUser.email })
            .expect(200);

        const emailBody = mockEmailService.sentEmails[0].html;
        const tokenMatch = emailBody.match(/token=([a-f0-9]+)/);
        const resetToken = tokenMatch[1];
        const newPassword = "NewPassword123";

        await request(app)
            .put("/users/password")
            .send({ resetToken, password: newPassword })
            .expect(204);

        const loginWithOldPassword = await request(app)
            .post("/users/login")
            .send({ email: uniqueUser.email, password: oldPassword })
            .expect(401);

        expect(loginWithOldPassword.body).toHaveProperty("error");

        const loginWithNewPassword = await request(app)
            .post("/users/login")
            .send({ email: uniqueUser.email, password: newPassword })
            .expect(200);

        expect(loginWithNewPassword.body).toHaveProperty("token");
    });
});
