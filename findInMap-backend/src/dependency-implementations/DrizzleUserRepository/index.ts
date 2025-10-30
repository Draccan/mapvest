import { eq } from "drizzle-orm";

import DbOrTransaction from "../../core/dependencies/DatabaseTransaction";
import UserRepository from "../../core/dependencies/UserRepository";
import UserEntity from "../../core/entities/UserEntity";
import CreateUserDto from "../../core/dtos/CreateUserDto";
import { db } from "../../db";
import { users } from "../../db/schema";
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
}
