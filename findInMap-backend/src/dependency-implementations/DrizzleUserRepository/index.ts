import { eq, inArray } from "drizzle-orm";

import DbOrTransaction from "../../core/dependencies/DatabaseTransaction";
import UserRepository from "../../core/dependencies/UserRepository";
import { PasswordResetTokenEntity } from "../../core/entities/PasswordResetTokenEntity";
import UserEntity from "../../core/entities/UserEntity";
import CreateUserDto from "../../core/dtos/CreateUserDto";
import { db } from "../../db";
import { users, passwordResetTokens } from "../../db/schema";
import makePasswordResetTokenEntity from "./converters/makePasswordResetTokenEntity";
import { makeUserEntity } from "./converters/makeUserEntity";

export class DrizzleUserRepository implements UserRepository {
    async create(
        userData: CreateUserDto,
        dbInstance: DbOrTransaction = db,
    ): Promise<UserEntity> {
        const [createdUser] = await dbInstance
            .insert(users)
            .values({
                name: userData.name,
                surname: userData.surname,
                email: userData.email.toLowerCase(),
                password: userData.password,
            })
            .returning();

        return makeUserEntity(createdUser);
    }

    async findByEmail(email: string): Promise<UserEntity | null> {
        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.email, email.toLowerCase()));

        return user ? makeUserEntity(user) : null;
    }

    async findById(userId: string): Promise<UserEntity | null> {
        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.id, userId));

        return user ? makeUserEntity(user) : null;
    }

    async findByIds(userIds: string[]): Promise<UserEntity[]> {
        if (userIds.length === 0) {
            return [];
        }

        const foundUsers = await db
            .select()
            .from(users)
            .where(inArray(users.id, userIds));

        return foundUsers.map((user) => makeUserEntity(user));
    }

    async findByEmails(emails: string[]): Promise<UserEntity[]> {
        if (emails.length === 0) {
            return [];
        }

        const lowercaseEmails = emails.map((email) => email.toLowerCase());

        const foundUsers = await db
            .select()
            .from(users)
            .where(inArray(users.email, lowercaseEmails));

        return foundUsers.map((user) => makeUserEntity(user));
    }

    async updatePassword(
        userId: string,
        hashedPassword: string,
    ): Promise<UserEntity> {
        const [updatedUser] = await db
            .update(users)
            .set({
                password: hashedPassword,
                updatedAt: new Date(),
            })
            .where(eq(users.id, userId))
            .returning();

        return makeUserEntity(updatedUser);
    }

    async createPasswordResetToken(
        userId: string,
        token: string,
        expiresAt: Date,
    ): Promise<PasswordResetTokenEntity> {
        const [passwordResetTokenData] = await db
            .insert(passwordResetTokens)
            .values({
                userId,
                token,
                expiresAt,
            })
            .returning();

        return makePasswordResetTokenEntity(passwordResetTokenData);
    }

    async findPasswordResetTokenData(
        token: string,
    ): Promise<PasswordResetTokenEntity | null> {
        const [passwordResetToken] = await db
            .select()
            .from(passwordResetTokens)
            .where(eq(passwordResetTokens.token, token));

        return passwordResetToken
            ? makePasswordResetTokenEntity(passwordResetToken)
            : null;
    }

    async deletePasswordResetToken(token: string): Promise<void> {
        await db
            .delete(passwordResetTokens)
            .where(eq(passwordResetTokens.token, token));
    }

    async deletePasswordResetTokensByUserId(userId: string): Promise<void> {
        await db
            .delete(passwordResetTokens)
            .where(eq(passwordResetTokens.userId, userId));
    }
}
