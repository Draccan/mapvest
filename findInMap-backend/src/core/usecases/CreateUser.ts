import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

import CreateUserDto from "../dtos/CreateUserDto";
import UserDto, { makeUserDto } from "../dtos/UserDto";
import UserEmailAlreadyRegistered from "../errors/UserEmailAlreadyRegistered";
import UserRepository from "../dependencies/UserRepository";

const scryptAsync = promisify(scrypt);

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

        // TODO better hashing (e.g., bcrypt, argon2)
        const hashedPassword = await this.hashPassword(userData.password);

        const userWithHashedPassword: CreateUserDto = {
            ...userData,
            password: hashedPassword,
        };

        const createdUser = await this.userRepository.create(
            userWithHashedPassword,
        );

        return makeUserDto(createdUser);
    }

    // TODO common util
    private async hashPassword(password: string): Promise<string> {
        const salt = randomBytes(32).toString("hex");
        const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
        return `${salt}:${derivedKey.toString("hex")}`;
    }
}
