export interface RateLimitErrorResponseDto {
    success: false;
    error: string;
    remainingTime: number;
}
