import GroupRepository from "../dependencies/GroupRepository";
import MapRepository from "../dependencies/MapRepository";
import MapDto, { makeMapDto } from "../dtos/MapDto";
import NotAllowedActionError from "../errors/NotAllowedActionError";

export default class GetGroupMaps {
    constructor(
        private mapRepository: MapRepository,
        private groupRepository: GroupRepository,
    ) {}

    async execute(groupId: string, userId: string): Promise<MapDto[]> {
        const groups = await this.groupRepository.memoizedFindByUserId(userId);
        if (groups.find((group) => group.group.id === groupId) === undefined) {
            throw new NotAllowedActionError("User cannot access this group");
        }

        const maps = await this.mapRepository.findMapByGroupId(groupId);

        return maps.map(makeMapDto);
    }
}
