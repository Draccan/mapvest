import GroupRepository from "../dependencies/GroupRepository";
import MapRepository from "../dependencies/MapRepository";
import UpdateCategoryDto from "../dtos/UpdateCategoryDto";
import { CategoryDto, makeCategoryDto } from "../dtos/CategoryDto";
import ItemNotFoundError from "../errors/ItemNotFoundError";
import NotAllowedActionError from "../errors/NotAllowedActionError";

export default class UpdateMapCategory {
    constructor(
        private groupRepository: GroupRepository,
        private mapRepository: MapRepository,
    ) {}

    async exec(
        userId: string,
        groupId: string,
        mapId: string,
        categoryId: string,
        data: UpdateCategoryDto,
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

        const category = await this.mapRepository.updateCategory(
            mapId,
            categoryId,
            data,
        );

        if (!category) {
            throw new ItemNotFoundError(
                "Category not found or does not belong to this map",
            );
        }

        return makeCategoryDto(category);
    }
}
