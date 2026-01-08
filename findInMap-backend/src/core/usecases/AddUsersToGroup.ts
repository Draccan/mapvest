import { UserGroupRole } from "../commons/enums";
import GroupRepository from "../dependencies/GroupRepository";
import UserRepository from "../dependencies/UserRepository";
import AddUsersToGroupDto from "../dtos/AddUsersToGroupDto";
import NotAllowedActionError from "../errors/NotAllowedActionError";

export default class AddUsersToGroup {
    constructor(
        private groupRepository: GroupRepository,
        private userRepository: UserRepository,
    ) {}

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

        // Warning: users not found will simply not be added
        const users = await this.userRepository.findByEmails(data.userEmails);
        const userIds = users.map((user) => user.id);

        if (userIds.length > 0) {
            await this.groupRepository.addUsersToGroup(
                userIds,
                groupId,
                UserGroupRole.Contributor,
            );
        }
    }
}
