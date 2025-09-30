import UserEntity from "../entities/UserEntity";

export default interface UserDto {
    id: string;
    name: string;
    surname: string;
    email: string;
    createdAt: string;
    updatedAt: string;
}

export function makeUserDto(userEntity: UserEntity): UserDto {
    return {
        id: userEntity.id,
        name: userEntity.name,
        surname: userEntity.surname,
        email: userEntity.email,
        createdAt: userEntity.createdAt.toISOString(),
        updatedAt: userEntity.updatedAt.toISOString(),
    };
}
