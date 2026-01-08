import GroupRepository from "../dependencies/GroupRepository";
import UserRepository from "../dependencies/UserRepository";
import UserGroupDto, { makeUserGroupDto } from "../dtos/UserGroupDto";
import NotAllowedActionError from "../errors/NotAllowedActionError";

export default class GetGroupUsers {
    constructor(
        private groupRepository: GroupRepository,
        private userRepository: UserRepository,
    ) {}

    async exec(groupId: string, userId: string): Promise<UserGroupDto[]> {
        const userGroups =
            await this.groupRepository.memoizedFindByUserId(userId);

        const hasAccessToGroup = userGroups.some(
            (userGroup) => userGroup.group.id === groupId,
        );

        if (!hasAccessToGroup) {
            throw new NotAllowedActionError(
                "User does not have access to this group",
            );
        }

        const userGroupRelations =
            await this.groupRepository.findUsersByGroupId(groupId);

        const userIds = userGroupRelations.map((relation) => relation.userId);

        const users = await this.userRepository.findByIds(userIds);

        return users.map((user) => {
            const relation = userGroupRelations.find(
                (rel) => rel.userId === user.id,
            );
            return makeUserGroupDto(user, relation!.role);
        });
    }
}
