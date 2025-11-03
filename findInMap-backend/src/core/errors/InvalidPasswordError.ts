export default class InvalidPasswordError extends Error {
    constructor(msg: string) {
        super(msg || "There is something wrong");
        this.name = "InvalidPasswordError";
    }
}
