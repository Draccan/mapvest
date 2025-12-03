export default class InvalidPasswordError extends Error {
    constructor(msg: string) {
        super(msg);
        this.name = "InvalidPasswordError";
    }
}
