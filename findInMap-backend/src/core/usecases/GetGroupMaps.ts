import GroupRepository from "../dependencies/GroupRepository";
import MapRepository from "../dependencies/MapRepository";
import NotAllowedActionError from "../errors/NotAllowedActionError";

export default class GetGroupMaps {
    constructor(
        private mapRepository: MapRepository,
        private groupRepository: GroupRepository,
    ) {}

    async execute(groupId: string, userId: string) {
        const groups = await this.groupRepository.findByUserId(userId);
        if (groups.find((group) => group.group.id === groupId) === undefined) {
            throw new NotAllowedActionError("User cannot access this group");
        }

        return this.mapRepository.findMapByGroupId(groupId);
    }
}
