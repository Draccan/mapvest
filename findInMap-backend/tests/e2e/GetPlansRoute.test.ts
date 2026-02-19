import request from "supertest";

import { Plan } from "../../src/core/commons/enums";
import { getTestApp } from "./setup";

describe("Get Plans Route", () => {
    it("GET /plans should return all plans", async () => {
        const app = getTestApp();
        const response = await request(app).get("/plans").expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThanOrEqual(2);
    });

    it("GET /plans should return plans with correct structure", async () => {
        const app = getTestApp();
        const response = await request(app).get("/plans").expect(200);

        response.body.forEach((plan: any) => {
            expect(typeof plan.name).toBe("string");
            expect(typeof plan.maxMapPoints).toBe("number");
            expect(plan).not.toHaveProperty("id");
        });
    });

    it("GET /plans should contain free and pro plans", async () => {
        const app = getTestApp();
        const response = await request(app).get("/plans").expect(200);

        const planNames = response.body.map((p: any) => p.name);
        expect(planNames).toContain("free");
        expect(planNames).toContain("pro");
    });

    it("GET /plans should return correct maxMapPoints values", async () => {
        const app = getTestApp();
        const response = await request(app).get("/plans").expect(200);

        const freePlan = response.body.find((p: any) => p.name === Plan.Free);
        const proPlan = response.body.find((p: any) => p.name === Plan.Pro);

        expect(freePlan.maxMapPoints).toBe(50);
        expect(proPlan.maxMapPoints).toBe(15000);
    });

    it("GET /plans should not require authentication", async () => {
        const app = getTestApp();
        const response = await request(app).get("/plans").expect(200);

        expect(Array.isArray(response.body)).toBe(true);
    });
});
