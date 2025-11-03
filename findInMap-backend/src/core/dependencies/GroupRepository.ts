import { UserGroupRole } from "../commons/enums";
import DetailedGroupEntity from "../entities/DetailedGroupEntity";
import GroupEntity from "../entities/GroupEntity";
import DbOrTransaction from "./DatabaseTransaction";

export default interface GroupRepository {
    findByUserId(userId: string): Promise<DetailedGroupEntity[]>;
    memoizedFindByUserId(userId: string): Promise<DetailedGroupEntity[]>;
    createGroup(
        groupName: string,
        userId: string,
        dbInstance?: DbOrTransaction,
    ): Promise<GroupEntity>;
    addUserToGroup(
        userId: string,
        groupId: string,
        role: UserGroupRole,
        dbInstance?: DbOrTransaction,
    ): Promise<void>;
}
