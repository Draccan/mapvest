import CreateUserDto from "../dtos/CreateUserDto";
import UserEntity from "../entities/UserEntity";

export default interface UserRepository {
    create(userData: CreateUserDto): Promise<UserEntity>;
    findByEmail(email: string): Promise<UserEntity | null>;
}
