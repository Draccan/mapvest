import { UserGroupRole } from "../commons/enums";
import DetailedGroupEntity from "../entities/DetailedGroupEntity";
import GroupEntity from "../entities/GroupEntity";
import { UserGroupRelation } from "../entities/UserGroupRelation";
import UpdateGroupDto from "../dtos/UpdateGroupDto";
import DbOrTransaction from "./DatabaseTransaction";

export default interface GroupRepository {
    findByUserId(userId: string): Promise<DetailedGroupEntity[]>;
    memoizedFindByUserId(userId: string): Promise<DetailedGroupEntity[]>;
    findUsersByGroupId(groupId: string): Promise<UserGroupRelation[]>;
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
    addUsersToGroup(
        userIds: string[],
        groupId: string,
        role: UserGroupRole,
        dbInstance?: DbOrTransaction,
    ): Promise<void>;
    removeUserFromGroup(
        userId: string,
        groupId: string,
        dbInstance?: DbOrTransaction,
    ): Promise<void>;
    updateGroup(
        groupId: string,
        userId: string,
        data: UpdateGroupDto,
    ): Promise<GroupEntity | null>;
}
