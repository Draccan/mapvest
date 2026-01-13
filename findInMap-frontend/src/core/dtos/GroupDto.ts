import type { UserGroupRole } from "../commons/enums";

export interface GroupDto {
    id: string;
    name: string;
    role: UserGroupRole;
}
