export class NotAuthorizedError extends Error {
    constructor(message: string = "Not authorized") {
        super(message);
        this.name = "NotAuthorizedError";
    }
}
