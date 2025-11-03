export default class UserEmailAlreadyRegisteredError extends Error {
    constructor() {
        super("There is something wrong");
        this.name = "UserEmailAlreadyRegisteredError";
    }
}
