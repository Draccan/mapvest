import crypto from "crypto";
import UserRepository from "../dependencies/UserRepository";
import ResetPasswordDto from "../dtos/ResetPasswordDto";
import EmailService from "../services/EmailService";
import LoggerService from "../services/LoggerService";

const TOKEN_EXPIRATION_HOURS = 1;

export default class ResetPassword {
    constructor(
        private userRepository: UserRepository,
        private emailService: EmailService,
        private frontendUrl: string,
    ) {}

    async exec(resetData: ResetPasswordDto): Promise<void> {
        const email = resetData.email.toLowerCase();

        const user = await this.userRepository.findByEmail(email);

        // Warning: Do not reveal whether the email exists in the system
        if (!user) {
            LoggerService.info(
                `Password reset requested for non-existent email: ${email}`,
            );
            return;
        }

        await this.userRepository.deletePasswordResetTokensByUserId(user.id);

        const resetToken = crypto.randomBytes(32).toString("hex");

        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + TOKEN_EXPIRATION_HOURS);

        await this.userRepository.createPasswordResetToken(
            user.id,
            resetToken,
            expiresAt,
        );

        await this.emailService.sendPasswordResetEmail(
            email,
            resetToken,
            this.frontendUrl,
        );

        LoggerService.info(
            `Password reset email sent to ${email} (userId: ${user.id})`,
        );
    }
}
