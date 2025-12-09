import UserRepository from "../dependencies/UserRepository";
import UpdateUserPasswordDto from "../dtos/UpdateUserPasswordDto";
import InvalidResetTokenError from "../errors/InvalidResetTokenError";
import LoggerService from "../services/LoggerService";
import { hashPassword } from "../utils/PasswordManager";
import { validatePassword } from "../utils/PasswordValidator";

export default class UpdateUserPassword {
    constructor(private userRepository: UserRepository) {}

    async exec(updateData: UpdateUserPasswordDto): Promise<void> {
        validatePassword(updateData.password);

        const passwordResetTokenData =
            await this.userRepository.findPasswordResetTokenData(
                updateData.resetToken,
            );

        if (!passwordResetTokenData) {
            LoggerService.warn(
                `Password reset attempted with invalid token: ${updateData.resetToken}`,
            );
            throw new InvalidResetTokenError();
        }

        if (passwordResetTokenData.expiresAt < new Date()) {
            LoggerService.warn(
                `Password reset attempted with expired token for userId: ${passwordResetTokenData.userId}`,
            );
            await this.userRepository.deletePasswordResetToken(
                updateData.resetToken,
            );
            throw new InvalidResetTokenError();
        }

        const hashedPassword = await hashPassword(updateData.password);

        await this.userRepository.updatePassword(
            passwordResetTokenData.userId,
            hashedPassword,
        );

        await this.userRepository.deletePasswordResetToken(
            updateData.resetToken,
        );

        LoggerService.info(
            `Password successfully updated for userId: ${passwordResetTokenData.userId}`,
        );
    }
}
