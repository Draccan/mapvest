import GroupRepository from "../dependencies/GroupRepository";
import MapRepository from "../dependencies/MapRepository";
import CreateMapDto from "../dtos/CreateMapDto";
import MapDto, { makeMapDto } from "../dtos/MapDto";
import NotAllowedActionError from "../errors/NotAllowedActionError";

export default class CreateGroupMap {
    constructor(
        private mapRepository: MapRepository,
        private groupRepository: GroupRepository,
    ) {}

    async execute(
        groupId: string,
        userId: string,
        data: CreateMapDto,
    ): Promise<MapDto> {
        const groups = await this.groupRepository.memoizedFindByUserId(userId);
        if (groups.find((group) => group.group.id === groupId) === undefined) {
            throw new NotAllowedActionError(
                "User cannot creates map for this group",
            );
        }

        const map = await this.mapRepository.createMap(groupId, data);

        // Warning: we need to invalidate the cache after creating a new map,
        // because we use the cache when we fetch the list of maps for a group
        // to get points and categories and check authorizations.
        this.mapRepository.invalidateMapsCache();

        return makeMapDto(map);
    }
}
