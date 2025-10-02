import CreateUserDto from "../dtos/CreateUserDto";
import UserDto, { makeUserDto } from "../dtos/UserDto";
import UserEmailAlreadyRegistered from "../errors/UserEmailAlreadyRegistered";
import UserRepository from "../dependencies/UserRepository";
import { hashPassword } from "../utils/PasswordManager";
export default class CreateUser {
    constructor(private userRepository: UserRepository) {}

    async exec(userData: CreateUserDto): Promise<UserDto> {
        if (userData.password.length < 8 || userData.password.length > 20) {
            throw new Error("Password must be between 8 and 20 characters");
        }

        const existingUser = await this.userRepository.findByEmail(
            userData.email,
        );
        if (existingUser) {
            throw new UserEmailAlreadyRegistered(userData.email);
        }

        const hashedPassword = await hashPassword(userData.password);

        const userWithHashedPassword: CreateUserDto = {
            ...userData,
            password: hashedPassword,
        };

        const createdUser = await this.userRepository.create(
            userWithHashedPassword,
        );

        return makeUserDto(createdUser);
    }
}
