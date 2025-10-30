import { UserGroupRole } from "../commons/enums";

export default interface UserGroupEntity {
    userId: string;
    groupId: string;
    role: UserGroupRole;
    createdAt: Date;
}
