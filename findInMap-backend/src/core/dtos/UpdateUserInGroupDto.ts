import { UserGroupRole } from "../commons/enums";

export default interface UpdateUserInGroupDto {
    role: Exclude<UserGroupRole, UserGroupRole.Owner>;
}
