export default class UserEmailAlreadyRegistered extends Error {
    constructor(email: string) {
        super(`User with email ${email} is already registered`);
        this.name = "UserEmailAlreadyRegistered";
    }
}
