import UserEntity from "../../../core/entities/UserEntity";
import { User } from "../../../db/schema";

export const makeUserEntity = (user: User): UserEntity => {
    return {
        id: user.id,
        name: user.name,
        surname: user.surname,
        email: user.email,
        password: user.password,
        createdAt: user.createdAt ?? new Date(),
        updatedAt: user.updatedAt ?? new Date(),
    };
};
