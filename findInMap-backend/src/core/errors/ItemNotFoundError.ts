export default class ItemNotFoundError extends Error {
    constructor(msg?: string) {
        super(msg || "Item not found");
        this.name = "ItemNotFoundError";
    }
}
