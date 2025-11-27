import GroupRepository from "../dependencies/GroupRepository";
import MapRepository from "../dependencies/MapRepository";
import CreateCategoryDto from "../dtos/CreateCategoryDto";
import { CategoryDto, makeCategoryDto } from "../dtos/CategoryDto";
import NotAllowedActionError from "../errors/NotAllowedActionError";

export default class CreateMapCategory {
    constructor(
        private groupRepository: GroupRepository,
        private mapRepository: MapRepository,
    ) {}

    async exec(
        userId: string,
        groupId: string,
        mapId: string,
        data: CreateCategoryDto,
    ): Promise<CategoryDto> {
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

        const category = await this.mapRepository.createCategory(mapId, data);

        return makeCategoryDto(category);
    }
}
