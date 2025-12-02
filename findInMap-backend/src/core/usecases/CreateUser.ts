import { db } from "../../db";
import GroupRepository from "../dependencies/GroupRepository";
import MapRepository from "../dependencies/MapRepository";
import UserRepository from "../dependencies/UserRepository";
import CreateUserDto from "../dtos/CreateUserDto";
import UserDto, { makeUserDto } from "../dtos/UserDto";
import UserEmailAlreadyRegisteredError from "../errors/UserEmailAlreadyRegisteredError";
import { hashPassword } from "../utils/PasswordManager";
import { validatePassword } from "../utils/PasswordValidator";

const FIRST_GROUP_NAME = "First Group";
const FIRST_MAP_NAME = "First Map";

export default class CreateUser {
    constructor(
        private userRepository: UserRepository,
        private groupRepository: GroupRepository,
        private mapRepository: MapRepository,
    ) {}

    async exec(userData: CreateUserDto): Promise<UserDto> {
        validatePassword(userData.password);

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

            const group = await this.groupRepository.createGroup(
                FIRST_GROUP_NAME,
                createdUser.id,
                transaction,
            );

            await this.mapRepository.createMap(
                group.id,
                {
                    name: FIRST_MAP_NAME,
                },
                transaction,
            );

            return createdUser;
        });

        return makeUserDto(result);
    }
}
