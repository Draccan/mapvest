import { Resend } from "resend";

import LoggerService from "./LoggerService";

export interface EmailOptions {
    to: string;
    subject: string;
    html: string;
}

export default class EmailService {
    private resend: Resend;

    constructor(
        private resendApiKey: string,
        private fromEmail: string,
        private fromName: string,
    ) {
        this.resend = new Resend(this.resendApiKey);
    }

    async sendEmail(options: EmailOptions): Promise<void> {
        try {
            await this.resend.emails.send({
                from: `${this.fromName} <${this.fromEmail}>`,
                to: options.to,
                subject: options.subject,
                html: options.html,
            });

            LoggerService.info(
                `Email sent successfully to ${options.to} with subject: ${options.subject}`,
            );
        } catch (error) {
            LoggerService.error(
                `Failed to send email to ${options.to}:`,
                error,
            );
            throw new Error("Failed to send email");
        }
    }

    async sendPasswordResetEmail(
        to: string,
        resetToken: string,
        frontendUrl: string,
    ): Promise<void> {
        const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Reimpostazione Password - MapVest</h2>
                <p>Hai richiesto di reimpostare la tua password.</p>
                <p>Clicca sul link qui sotto per procedere con la reimpostazione:</p>
                <p>
                    <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
                        Reimposta Password
                    </a>
                </p>
                <p>Oppure copia e incolla questo link nel tuo browser:</p>
                <p style="word-break: break-all;">${resetLink}</p>
                <p><strong>Questo link scadrà tra 1 ora.</strong></p>
                <p>Se non hai richiesto questa reimpostazione, puoi ignorare questa email.</p>
                <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
                <p style="color: #666; font-size: 12px;">MapVest Team</p>
            </div>
        `;

        await this.sendEmail({
            to,
            subject: "Reset Password - MapVest",
            html,
        });
    }
}
