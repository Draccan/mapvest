import { UserGroupRole } from "../../../core/commons/enums";
import { UserGroupRelation } from "../../../core/entities/UserGroupRelation";
import { UserGroup } from "../../../db/schema";

export const makeUserGroupRelationEntity = (
    userGroupRelation: UserGroup,
): UserGroupRelation => {
    return {
        userId: userGroupRelation.userId,
        role: userGroupRelation.role as UserGroupRole,
    };
};
