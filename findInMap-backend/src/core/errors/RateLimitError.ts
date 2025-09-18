export class RateLimitError extends Error {
    public readonly statusCode: number = 429;
    public readonly remainingTime: number;

    constructor(remainingTimeSeconds: number) {
        super(
            `Rate limit exceeded. Please wait ${remainingTimeSeconds} seconds before making another request.`,
        );
        this.name = "RateLimitError";
        this.remainingTime = remainingTimeSeconds;
    }
}
