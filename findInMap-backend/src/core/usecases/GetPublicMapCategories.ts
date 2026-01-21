import MapRepository from "../dependencies/MapRepository";
import { CategoryDto, makeCategoryDto } from "../dtos/CategoryDto";
import ItemNotFoundError from "../errors/ItemNotFoundError";

export default class GetPublicMapCategories {
    constructor(private mapRepository: MapRepository) {}

    async exec(publicMapId: string): Promise<CategoryDto[]> {
        const map = await this.mapRepository.findMapByPublicId(publicMapId);

        if (!map) {
            throw new ItemNotFoundError("Public map not found");
        }

        const categories = await this.mapRepository.findCategoriesByMapId(
            map.id,
        );
        return categories.map(makeCategoryDto);
    }
}
