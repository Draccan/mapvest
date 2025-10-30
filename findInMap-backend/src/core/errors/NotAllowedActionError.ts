export default class NotAllowedActionError extends Error {
    constructor(msg: string) {
        super(msg);
        this.name = "NotAllowedActionError";
    }
}
