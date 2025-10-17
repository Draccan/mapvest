import request from "supertest";

import { getTestApp } from "./setup";

describe("Health Route", () => {
    it("GET /health should return health status", async () => {
        const app = getTestApp();
        const response = await request(app).get("/health").expect(200);

        expect(response.body.status).toBe("ok");
        expect(response.body.message).toBeDefined();
        expect(response.body.timestamp).toBeDefined();
    });
});
