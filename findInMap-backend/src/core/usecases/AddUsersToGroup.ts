import { UserGroupRole } from "../commons/enums";
import GroupRepository from "../dependencies/GroupRepository";
import AddUsersToGroupDto from "../dtos/AddUsersToGroupDto";
import NotAllowedActionError from "../errors/NotAllowedActionError";

export default class AddUsersToGroup {
    constructor(private groupRepository: GroupRepository) {}

    async exec(
        userId: string,
        groupId: string,
        data: AddUsersToGroupDto,
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
                "User must be owner or admin to add users to group",
            );
        }

        await this.groupRepository.addUsersToGroup(
            data.userIds,
            groupId,
            UserGroupRole.Contributor,
        );
    }
}
