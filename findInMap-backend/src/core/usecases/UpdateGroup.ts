import GroupRepository from "../dependencies/GroupRepository";
import GroupDto, { makeGroupDto } from "../dtos/GroupDto";
import UpdateGroupDto from "../dtos/UpdateGroupDto";
import NotAllowedActionError from "../errors/NotAllowedActionError";

export default class UpdateGroup {
    constructor(private groupRepository: GroupRepository) {}

    async exec(
        userId: string,
        groupId: string,
        data: UpdateGroupDto,
    ): Promise<Omit<GroupDto, "role">> {
        const groups = await this.groupRepository.memoizedFindByUserId(userId);
        if (groups.find((group) => group.group.id === groupId) === undefined) {
            throw new NotAllowedActionError("User cannot access this group");
        }

        const updatedGroup = await this.groupRepository.updateGroup(
            groupId,
            userId,
            data,
        );

        if (!updatedGroup) {
            throw new NotAllowedActionError("Group not found or access denied");
        }

        return makeGroupDto(updatedGroup);
    }
}
