import GroupRepository from "../dependencies/GroupRepository";
import MapRepository from "../dependencies/MapRepository";
import UpdateMapDto from "../dtos/UpdateMapDto";
import MapDto, { makeMapDto } from "../dtos/MapDto";
import NotAllowedActionError from "../errors/NotAllowedActionError";

export default class UpdateMap {
    constructor(
        private mapRepository: MapRepository,
        private groupRepository: GroupRepository,
    ) {}

    async execute(
        mapId: string,
        groupId: string,
        userId: string,
        data: UpdateMapDto,
    ): Promise<MapDto> {
        const groups = await this.groupRepository.memoizedFindByUserId(userId);
        if (groups.find((group) => group.group.id === groupId) === undefined) {
            throw new NotAllowedActionError(
                "User cannot access map for this group",
            );
        }

        const maps = await this.mapRepository.memoizedFindMapByGroupId(groupId);
        if (maps.find((map) => map.id === mapId) === undefined) {
            throw new NotAllowedActionError(
                "This group has no access to the specified map",
            );
        }

        const updatedMap = await this.mapRepository.updateMap(
            mapId,
            groupId,
            data,
        );

        if (!updatedMap) {
            throw new NotAllowedActionError("Map not found");
        }

        return makeMapDto(updatedMap);
    }
}
