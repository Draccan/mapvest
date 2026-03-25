export default class NotAuthorizedError extends Error {
    constructor(action: string) {
        super(`Action not authorized: ${action}`);
        this.name = "NotAuthorizedError";
    }
}
