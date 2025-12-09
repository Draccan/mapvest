import CreateUserDto from "../dtos/CreateUserDto";
import { PasswordResetTokenEntity } from "../entities/PasswordResetTokenEntity";
import UserEntity from "../entities/UserEntity";
import DbOrTransaction from "./DatabaseTransaction";

export default interface UserRepository {
    create(
        userData: CreateUserDto,
        dbInstance?: DbOrTransaction,
    ): Promise<UserEntity>;
    findByEmail(email: string): Promise<UserEntity | null>;
    findById(userId: string): Promise<UserEntity | null>;
    updatePassword(userId: string, hashedPassword: string): Promise<UserEntity>;
    createPasswordResetToken(
        userId: string,
        token: string,
        expiresAt: Date,
    ): Promise<PasswordResetTokenEntity>;
    deletePasswordResetTokensByUserId(userId: string): Promise<void>;
}
