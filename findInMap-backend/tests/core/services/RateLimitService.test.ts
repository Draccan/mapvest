import { InMemoryRateLimitService } from "../../../src/core/services/RateLimitService";

describe("InMemoryRateLimitService", () => {
    let rateLimitService: InMemoryRateLimitService;
    const rateLimitWindowSeconds = 1;

    beforeEach(() => {
        rateLimitService = new InMemoryRateLimitService(rateLimitWindowSeconds);
    });

    afterEach(() => {
        rateLimitService.destroy();
    });

    describe("isAllowed", () => {
        it("should allow first request from client", () => {
            const clientIp = "192.168.1.1";

            const isAllowed = rateLimitService.isAllowed(clientIp);
            expect(isAllowed).toBe(true);
        });

        it("should not allow rapid consecutive requests", () => {
            const clientIp = "192.168.1.2";

            expect(rateLimitService.isAllowed(clientIp)).toBe(true);
            rateLimitService.recordRequest(clientIp);

            expect(rateLimitService.isAllowed(clientIp)).toBe(false);
        });

        it("should allow requests after rate limit window expires", async () => {
            const clientIp = "192.168.1.3";

            expect(rateLimitService.isAllowed(clientIp)).toBe(true);
            rateLimitService.recordRequest(clientIp);

            expect(rateLimitService.isAllowed(clientIp)).toBe(false);

            await new Promise((resolve) =>
                setTimeout(resolve, rateLimitWindowSeconds * 1000 + 100),
            );

            expect(rateLimitService.isAllowed(clientIp)).toBe(true);
        });

        it("should handle different clients independently", () => {
            const clientIp1 = "192.168.1.4";
            const clientIp2 = "192.168.1.5";

            expect(rateLimitService.isAllowed(clientIp1)).toBe(true);
            rateLimitService.recordRequest(clientIp1);

            expect(rateLimitService.isAllowed(clientIp2)).toBe(true);
            rateLimitService.recordRequest(clientIp2);

            expect(rateLimitService.isAllowed(clientIp1)).toBe(false);
            expect(rateLimitService.isAllowed(clientIp2)).toBe(false);
        });
    });

    describe("getRemainingTime", () => {
        it("should return 0 for new client", () => {
            const clientIp = "192.168.1.7";
            const remainingTime = rateLimitService.getRemainingTime(clientIp);
            expect(remainingTime).toBe(0);
        });

        it("should return remaining time after request", () => {
            const clientIp = "192.168.1.8";

            rateLimitService.recordRequest(clientIp);
            const remainingTime = rateLimitService.getRemainingTime(clientIp);

            expect(remainingTime).toBeGreaterThan(0);
            expect(remainingTime).toBeLessThanOrEqual(rateLimitWindowSeconds);
        });

        it("should decrease remaining time over time", async () => {
            const clientIp = "192.168.1.9";

            rateLimitService.recordRequest(clientIp);
            const initialTime = rateLimitService.getRemainingTime(clientIp);

            await new Promise((resolve) => setTimeout(resolve, 500));

            const laterTime = rateLimitService.getRemainingTime(clientIp);
            expect(laterTime).toBeLessThanOrEqual(initialTime);
        });
    });

    describe("cleanup", () => {
        it("should remove expired entries", async () => {
            const clientIp = "192.168.1.10";

            rateLimitService.recordRequest(clientIp);
            expect(rateLimitService.isAllowed(clientIp)).toBe(false);

            await new Promise((resolve) =>
                setTimeout(resolve, rateLimitWindowSeconds * 1000 + 100),
            );

            rateLimitService.cleanup();

            expect(rateLimitService.isAllowed(clientIp)).toBe(true);
        });
    });

    describe("destroy", () => {
        it("should clear all rate limit data", () => {
            const clientIp = "192.168.1.11";

            rateLimitService.recordRequest(clientIp);
            expect(rateLimitService.isAllowed(clientIp)).toBe(false);

            rateLimitService.destroy();

            expect(rateLimitService.isAllowed(clientIp)).toBe(true);
        });

        it("should stop cleanup interval", () => {
            const spy = jest.spyOn(global, "clearInterval");

            rateLimitService.destroy();

            expect(spy).toHaveBeenCalled();
            spy.mockRestore();
        });
    });
});
