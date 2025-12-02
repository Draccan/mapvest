import UserRepository from "../dependencies/UserRepository";
import UserDto, { makeUserDto } from "../dtos/UserDto";
import UserNotFoundError from "../errors/UserNotFoundError";

export default class GetUser {
    constructor(private userRepository: UserRepository) {}

    async exec(userId: string): Promise<UserDto> {
        const user = await this.userRepository.findById(userId);

        if (!user) {
            throw new UserNotFoundError();
        }

        return makeUserDto(user);
    }
}
