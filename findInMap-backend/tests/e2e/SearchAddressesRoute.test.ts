import request from "supertest";

import { getTestApp } from "./setup";
import { testUser } from "./helpers";

describe("Search Addresses Route", () => {
    let app: any;
    let accessToken: string;

    beforeAll(async () => {
        app = getTestApp();

        await request(app).post("/users").send(testUser);

        const loginResponse = await request(app).post("/users/login").send({
            email: testUser.email,
            password: testUser.password,
        });

        accessToken = loginResponse.body.token;
    });

    it("GET /search/addresses should return 401 without token", async () => {
        const response = await request(app)
            .get("/search/addresses")
            .query({ text: "Milan" })
            .expect(401);

        expect(response.body).toHaveProperty("error");
    });

    it("GET /search/addresses should return 401 with invalid token", async () => {
        const response = await request(app)
            .get("/search/addresses")
            .set("Authorization", "Bearer invalid-token")
            .query({ text: "Milan" })
            .expect(401);

        expect(response.body).toHaveProperty("error");
    });

    it("GET /search/addresses should return 400 when text param is missing", async () => {
        const response = await request(app)
            .get("/search/addresses")
            .set("Authorization", `Bearer ${accessToken}`)
            .expect(400);

        expect(response.body).toHaveProperty("name", "InvalidRequestError");
    });
});
