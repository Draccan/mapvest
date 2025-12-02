import UserRepository from "../dependencies/UserRepository";
import UpdateUserDto from "../dtos/UpdateUserDto";
import IncorrectPasswordError from "../errors/IncorrectPasswordError";
import { hashPassword, verifyPassword } from "../utils/PasswordManager";
import { validatePassword } from "../utils/PasswordValidator";

export default class UpdateUser {
    constructor(private userRepository: UserRepository) {}

    async exec(userId: string, updateData: UpdateUserDto): Promise<void> {
        const user = await this.userRepository.findById(userId);

        if (!user) {
            throw new Error("User not found");
        }

        const isPasswordCorrect = await verifyPassword(
            updateData.currentPassword,
            user.password,
        );

        if (!isPasswordCorrect) {
            throw new IncorrectPasswordError();
        }

        validatePassword(updateData.newPassword);

        const hashedPassword = await hashPassword(updateData.newPassword);

        await this.userRepository.updatePassword(userId, hashedPassword);
    }
}
