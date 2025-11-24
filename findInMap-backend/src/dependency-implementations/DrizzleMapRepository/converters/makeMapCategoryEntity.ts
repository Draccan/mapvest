import { MapCategoryEntity } from "../../../core/entities/MapCategoryEntity";
import { MapCategory } from "../../../db/schema";

export function makeMapCategoryEntity(
    category: MapCategory,
): MapCategoryEntity {
    return {
        id: category.id,
        map_id: category.mapId,
        description: category.description,
        color: category.color,
        created_at: category.createdAt!,
        updated_at: category.updatedAt!,
    };
}
