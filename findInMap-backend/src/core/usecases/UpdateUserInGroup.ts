import { UserGroupRole } from "../commons/enums";
import GroupRepository from "../dependencies/GroupRepository";
import UpdateUserInGroupDto from "../dtos/UpdateUserInGroupDto";
import NotAllowedActionError from "../errors/NotAllowedActionError";

export default class UpdateUserInGroup {
    constructor(private groupRepository: GroupRepository) {}

    async exec(
        requestingUserId: string,
        groupId: string,
        targetUserId: string,
        data: UpdateUserInGroupDto,
    ): Promise<void> {
        const groups =
            await this.groupRepository.memoizedFindByUserId(requestingUserId);
        const userGroup = groups.find((group) => group.group.id === groupId);

        if (userGroup === undefined) {
            throw new NotAllowedActionError("User cannot access this group");
        }

        if (
            userGroup.role !== UserGroupRole.Owner &&
            userGroup.role !== UserGroupRole.Admin
        ) {
            throw new NotAllowedActionError(
                "User must be owner or admin to update the user in group",
            );
        }

        const groupUsers =
            await this.groupRepository.findUsersByGroupId(groupId);
        const targetUserRelation = groupUsers.find(
            (user) => user.userId === targetUserId,
        );

        if (!targetUserRelation) {
            throw new NotAllowedActionError(
                "The user to update is not in the group",
            );
        }

        if (targetUserRelation.role === UserGroupRole.Owner) {
            throw new NotAllowedActionError(
                "Cannot change the role of the group owner",
            );
        }

        await this.groupRepository.updateUserInGroup(
            targetUserId,
            groupId,
            data.role,
        );
    }
}
