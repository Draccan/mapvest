import { MapCategoryEntity } from "../entities/MapCategoryEntity";

export interface CategoryDto {
    id: string;
    description: string;
    color: string;
}

export function makeCategoryDto(category: MapCategoryEntity): CategoryDto {
    return {
        id: category.id,
        description: category.description,
        color: category.color,
    };
}
