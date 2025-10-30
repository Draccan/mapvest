import CreateUserDto from "../dtos/CreateUserDto";
import UserEntity from "../entities/UserEntity";
import DbOrTransaction from "./DatabaseTransaction";

export default interface UserRepository {
    create(
        userData: CreateUserDto,
        dbInstance?: DbOrTransaction,
    ): Promise<UserEntity>;
    findByEmail(email: string): Promise<UserEntity | null>;
}
