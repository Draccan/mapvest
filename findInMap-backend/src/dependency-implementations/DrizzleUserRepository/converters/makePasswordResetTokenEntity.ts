import { PasswordResetTokenEntity } from "../../../core/entities/PasswordResetTokenEntity";
import { PasswordResetToken } from "../../../db/schema";

export default function makePasswordResetTokenEntity(
    data: PasswordResetToken,
): PasswordResetTokenEntity {
    return {
        id: data.id,
        userId: data.userId,
        token: data.token,
        expiresAt: data.expiresAt,
        createdAt: data.createdAt,
    };
}
