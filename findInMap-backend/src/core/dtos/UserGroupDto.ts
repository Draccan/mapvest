import { UserGroupRole } from "../commons/enums";
import UserEntity from "../entities/UserEntity";

export default interface UserGroupDto {
    id: string;
    name: string;
    surname: string;
    email: string;
    userGroupRole: UserGroupRole;
}

export function makeUserGroupDto(
    userEntity: UserEntity,
    role: UserGroupRole,
): UserGroupDto {
    return {
        id: userEntity.id,
        name: userEntity.name,
        surname: userEntity.surname,
        email: userEntity.email,
        userGroupRole: role,
    };
}
