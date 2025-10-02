const jwt = require("jsonwebtoken");

interface UserPayload {
    userId: string;
    email: string;
}

export default class JwtService {
    private readonly secret: string;
    private readonly expiresIn: string = "15m";

    constructor(secret: string) {
        this.secret = secret;
    }

    generateToken(payload: UserPayload): string {
        return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn });
    }

    verifyToken(token: string): UserPayload | null {
        try {
            const decoded = jwt.verify(token, this.secret);
            if (
                typeof decoded === "object" &&
                decoded.userId &&
                decoded.email
            ) {
                return {
                    userId: decoded.userId as string,
                    email: decoded.email as string,
                };
            }
            return null;
        } catch (error) {
            return null;
        }
    }
}
