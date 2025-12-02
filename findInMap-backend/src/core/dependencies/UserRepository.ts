import CreateUserDto from "../dtos/CreateUserDto";
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
}
