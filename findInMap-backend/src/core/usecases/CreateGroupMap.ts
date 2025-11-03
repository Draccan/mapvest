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
        const groups = await this.groupRepository.findByUserId(userId);
        if (groups.find((group) => group.group.id === groupId) === undefined) {
            throw new NotAllowedActionError(
                "User cannot creates map for this group",
            );
        }

        const map = await this.mapRepository.createMap(groupId, data);

        return makeMapDto(map);
    }
}
