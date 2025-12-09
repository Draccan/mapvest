import request from "supertest";

import { testUser, getMockEmailService } from "./helpers";
import { getTestApp } from "./setup";

describe("Reset Password Route", () => {
    let app: any;
    let mockEmailService: any;

    beforeAll(() => {
        app = getTestApp();
        mockEmailService = getMockEmailService();
    });

    beforeEach(() => {
        mockEmailService.clearSentEmails();
    });

    it("POST /users/resetPassword should send reset email for existing user", async () => {
        const uniqueUser = {
            ...testUser,
            email: `reset-test-${Date.now()}@example.com`,
        };

        await request(app).post("/users").send(uniqueUser).expect(201);

        await request(app)
            .post("/users/resetPassword")
            .send({ email: uniqueUser.email })
            .expect(200);

        expect(mockEmailService.sentEmails).toHaveLength(1);
        expect(mockEmailService.sentEmails[0].to).toBe(uniqueUser.email);
        expect(mockEmailService.sentEmails[0].subject).toContain(
            "Reset Password",
        );
    });

    it("POST /users/resetPassword should not reveal if email doesn't exist", async () => {
        await request(app)
            .post("/users/resetPassword")
            .send({ email: "nonexistent@example.com" })
            .expect(200);

        expect(mockEmailService.sentEmails).toHaveLength(0);
    });

    it("POST /users/resetPassword should validate email format", async () => {
        const response = await request(app)
            .post("/users/resetPassword")
            .send({ email: "invalid-email" })
            .expect(400);

        expect(response.body).toHaveProperty("name", "InvalidRequestError");
    });

    it("POST /users/resetPassword should require email field", async () => {
        const response = await request(app)
            .post("/users/resetPassword")
            .send({})
            .expect(400);

        expect(response.body).toHaveProperty("name", "InvalidRequestError");
    });

    it("POST /users/resetPassword should be accessible without authentication", async () => {
        const response = await request(app)
            .post("/users/resetPassword")
            .send({ email: "test@example.com" });

        expect(response.status).not.toBe(401);
    });

    it("POST /users/resetPassword should handle multiple reset requests for same user", async () => {
        const uniqueUser = {
            ...testUser,
            email: `multi-reset-${Date.now()}@example.com`,
        };

        await request(app).post("/users").send(uniqueUser).expect(201);

        await request(app)
            .post("/users/resetPassword")
            .send({ email: uniqueUser.email })
            .expect(200);

        expect(mockEmailService.sentEmails).toHaveLength(1);

        await request(app)
            .post("/users/resetPassword")
            .send({ email: uniqueUser.email })
            .expect(200);

        expect(mockEmailService.sentEmails).toHaveLength(2);
    });
});
