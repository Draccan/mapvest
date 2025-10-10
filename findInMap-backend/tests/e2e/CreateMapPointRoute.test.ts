import request from "supertest";

import { getTestApp } from "./setup";
import { testMapPoint } from "./helpers";

describe("Create Map Point Route", () => {
    let app: any;

    beforeAll(() => {
        app = getTestApp();
    });

    it("POST /map-points should create a new map point", async () => {
        const response = await request(app)
            .post("/api/map-points")
            .send(testMapPoint)
            .expect(201);

        expect(response.body).toHaveProperty("id");
        expect(response.body.long).toBe(testMapPoint.long);
        expect(response.body.lat).toBe(testMapPoint.lat);
        expect(response.body.type).toBe(testMapPoint.type);
    });
});
