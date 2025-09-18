export interface RateLimitService {
    isAllowed(ip: string): boolean;
    recordRequest(ip: string): void;
    cleanup(): void;
    getRemainingTime(ip: string): number;
}

export class InMemoryRateLimitService implements RateLimitService {
    private requestMap: Map<string, number> = new Map();
    private readonly timeWindowMs: number;
    private cleanupInterval: NodeJS.Timeout;

    constructor(timeWindowSeconds: number = 15) {
        this.timeWindowMs = timeWindowSeconds * 1000;

        // Cleanup expired entries every 20 seconds
        this.cleanupInterval = setInterval(() => this.cleanup(), 20000);
    }

    isAllowed(ip: string): boolean {
        const now = Date.now();
        const lastRequest = this.requestMap.get(ip);

        if (!lastRequest) {
            return true;
        }

        return now - lastRequest >= this.timeWindowMs;
    }

    recordRequest(ip: string): void {
        this.requestMap.set(ip, Date.now());
    }

    getRemainingTime(ip: string): number {
        const now = Date.now();
        const lastRequest = this.requestMap.get(ip);

        if (!lastRequest) {
            return 0;
        }

        const elapsed = now - lastRequest;
        const remaining = Math.max(0, this.timeWindowMs - elapsed);
        return Math.ceil(remaining / 1000); // Return seconds
    }

    cleanup(): void {
        const now = Date.now();

        for (const [ip, timestamp] of this.requestMap.entries()) {
            if (now - timestamp >= this.timeWindowMs) {
                this.requestMap.delete(ip);
            }
        }
    }

    destroy(): void {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }
        this.requestMap.clear();
    }
}
