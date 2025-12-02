import InvalidPasswordError from "../errors/InvalidPasswordError";

export function validatePassword(password: string): void {
    if (password.length < 8 || password.length > 20) {
        throw new InvalidPasswordError(
            "Password must be between 8 and 20 characters",
        );
    }
}
