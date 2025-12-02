export default class IncorrectPasswordError extends Error {
    constructor() {
        super("Current password is incorrect");
        this.name = "IncorrectPasswordError";
    }
}
