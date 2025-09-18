export default function getClientIp(req: any): string {
    return (
        req.headers["x-forwarded-for"]?.split(",")[0] ||
        req.headers["x-real-ip"] ||
        req.connection?.remoteAddress ||
        req.socket?.remoteAddress ||
        req.ip ||
        "127.0.0.1"
    );
}
