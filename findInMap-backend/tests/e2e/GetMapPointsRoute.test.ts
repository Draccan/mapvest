import request from "supertest";

import { getTestApp } from "./setup";
import { testMapPoint } from "./helpers";

describe("Get Map Points Route", () => {
    let app: any;

    beforeAll(() => {
        app = getTestApp();
    });

    it("GET /map-points should return empty array initially", async () => {
        const response = await request(app).get("/api/map-points").expect(200);

        expect(Array.isArray(response.body)).toBe(true);
    });

    it("GET /map-points should return created map points", async () => {
        await request(app).post("/api/map-points").send(testMapPoint);

        const response = await request(app).get("/api/map-points").expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
    });
});
