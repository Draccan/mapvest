import { AuthorizableAction } from "../commons/enums";
import Authorizer from "../dependencies/Authorizer";
import GroupRepository from "../dependencies/GroupRepository";
import MapRepository from "../dependencies/MapRepository";
import CreateMapPointDto from "../dtos/CreateMapPointDto";
import MapPointDto, { makeMapPointDto } from "../dtos/MapPointDto";
import NotAllowedActionError from "../errors/NotAllowedActionError";

export default class CreateMapPoint {
    constructor(
        private authorizer: Authorizer,
        private groupRepository: GroupRepository,
        private mapRepository: MapRepository,
    ) {}

    async exec(
        data: CreateMapPointDto,
        userId: string,
        groupId: string,
        mapId: string,
    ): Promise<MapPointDto> {
        const groups = await this.groupRepository.memoizedFindByUserId(userId);
        const userGroup = groups.find((group) => group.group.id === groupId);
        if (userGroup === undefined) {
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

        await this.authorizer.checkAction(
            AuthorizableAction.AddMapPoints,
            userGroup.group,
            { count: 1 },
        );

        const mapPoint = await this.mapRepository.createMapPoint(data, mapId);

        return makeMapPointDto(mapPoint);
    }
}
