import { UserGroupRole } from "../commons/enums";
import GroupRepository from "../dependencies/GroupRepository";
import NotAllowedActionError from "../errors/NotAllowedActionError";

export default class RemoveUserFromGroup {
    constructor(private groupRepository: GroupRepository) {}

    async exec(
        userId: string,
        groupId: string,
        userIdToRemove: string,
    ): Promise<void> {
        const groups = await this.groupRepository.memoizedFindByUserId(userId);
        const userGroup = groups.find((group) => group.group.id === groupId);

        if (userGroup === undefined) {
            throw new NotAllowedActionError("User cannot access this group");
        }

        if (
            userGroup.role !== UserGroupRole.Owner &&
            userGroup.role !== UserGroupRole.Admin
        ) {
            throw new NotAllowedActionError(
                "User must be owner or admin to remove users from group",
            );
        }

        await this.groupRepository.removeUserFromGroup(userIdToRemove, groupId);
    }
}
