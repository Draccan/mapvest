import GroupRepository from "../dependencies/GroupRepository";
import MapRepository from "../dependencies/MapRepository";
import { CreateMapPointDto } from "../dtos/CreateMapPointDto";
import { makeMapPointDto, MapPointDto } from "../dtos/MapPointDto";
import NotAllowedActionError from "../errors/NotAllowedActionError";

export default class CreateMapPoint {
    constructor(
        private groupRepository: GroupRepository,
        private mapRepository: MapRepository,
    ) {}

    async exec(
        data: CreateMapPointDto,
        userId: string,
        groupId: string,
        mapId: string,
    ): Promise<MapPointDto> {
        const groups = await this.groupRepository.findByUserId(userId);
        if (groups.find((group) => group.group.id === groupId) === undefined) {
            throw new NotAllowedActionError(
                "User cannot access map for this group",
            );
        }

        const maps = await this.mapRepository.findMapByGroupId(groupId);
        if (maps.find((map) => map.id === mapId) === undefined) {
            throw new NotAllowedActionError(
                "This group has no access to the specified map",
            );
        }

        const mapPoint = await this.mapRepository.createMapPoint(data, mapId);

        return makeMapPointDto(mapPoint);
    }
}
