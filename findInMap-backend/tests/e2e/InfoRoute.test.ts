import request from "supertest";

import { getTestApp } from "./setup";

describe("Info Route", () => {
    it("GET /info should return server info", async () => {
        const app = getTestApp();
        const response = await request(app).get("/info").expect(200);

        expect(response.body).toHaveProperty("name");
        expect(response.body).toHaveProperty("version");
        expect(response.body).toHaveProperty("description");
        expect(response.body).toHaveProperty("swagger");
    });
});
