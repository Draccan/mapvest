import { db } from "../../db";
import GroupRepository from "../dependencies/GroupRepository";
import UserRepository from "../dependencies/UserRepository";
import CreateUserDto from "../dtos/CreateUserDto";
import UserDto, { makeUserDto } from "../dtos/UserDto";
import InvalidPasswordError from "../errors/InvalidPasswordError";
import UserEmailAlreadyRegisteredError from "../errors/UserEmailAlreadyRegisteredError";
import { hashPassword } from "../utils/PasswordManager";

const FIRST_GROUP_NAME = "First Group";

export default class CreateUser {
    constructor(
        private userRepository: UserRepository,
        private groupRepository: GroupRepository,
    ) {}

    async exec(userData: CreateUserDto): Promise<UserDto> {
        if (userData.password.length < 8 || userData.password.length > 20) {
            throw new InvalidPasswordError(
                "Password must be between 8 and 20 characters",
            );
        }

        const existingUser = await this.userRepository.findByEmail(
            userData.email,
        );
        if (existingUser) {
            throw new UserEmailAlreadyRegisteredError();
        }

        const hashedPassword = await hashPassword(userData.password);

        const userWithHashedPassword: CreateUserDto = {
            ...userData,
            password: hashedPassword,
        };

        const result = await db.transaction(async (transaction) => {
            const createdUser = await this.userRepository.create(
                userWithHashedPassword,
                transaction,
            );

            await this.groupRepository.createGroup(
                FIRST_GROUP_NAME,
                createdUser.id,
                transaction,
            );

            return createdUser;
        });

        return makeUserDto(result);
    }
}
