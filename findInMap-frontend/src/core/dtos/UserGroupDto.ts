import type { UserGroupRole } from "../commons/enums";

export default interface UserGroupDto {
    id: string;
    name: string;
    surname: string;
    email: string;
    userGroupRole: UserGroupRole;
}
