import GroupRepository from "../dependencies/GroupRepository";
import MapRepository from "../dependencies/MapRepository";
import { UpdateMapPointDto } from "../dtos/UpdateMapPointDto";
import MapPointDto, { makeMapPointDto } from "../dtos/MapPointDto";
import ItemNotFoundError from "../errors/ItemNotFoundError";
import NotAllowedActionError from "../errors/NotAllowedActionError";

export default class UpdateMapPoint {
    constructor(
        private groupRepository: GroupRepository,
        private mapRepository: MapRepository,
    ) {}

    async exec(
        pointId: string,
        data: UpdateMapPointDto,
        userId: string,
        groupId: string,
        mapId: string,
    ): Promise<MapPointDto> {
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

        const updatedMapPoint = await this.mapRepository.updateMapPoint(
            pointId,
            mapId,
            data,
        );

        if (!updatedMapPoint) {
            throw new ItemNotFoundError(
                "Map point not found or does not belong to this map",
            );
        }

        return makeMapPointDto(updatedMapPoint);
    }
}
