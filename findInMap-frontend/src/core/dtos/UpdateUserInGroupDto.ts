import type { UserGroupRole } from "../commons/enums";

export interface UpdateUserInGroupDto {
    role: Exclude<UserGroupRole, UserGroupRole.Owner>;
}
