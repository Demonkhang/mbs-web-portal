export interface RateLimitOptions {
    windowMs: number;
    max: number;
}
export declare function checkRateLimit(ip: string, options?: RateLimitOptions): {
    allowed: boolean;
    remaining: number;
    resetInMs: number;
};
