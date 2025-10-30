export default class UserEmailAlreadyRegistered extends Error {
    constructor() {
        super("There is something wrong");
        this.name = "UserEmailAlreadyRegistered";
    }
}
