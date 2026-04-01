import type { Plan, UserGroupRole } from "../commons/enums";

export interface GroupDto {
    id: string;
    name: string;
    role: UserGroupRole;
    plan: Plan;
}
