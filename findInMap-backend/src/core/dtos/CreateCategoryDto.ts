import { CategoryDto } from "./CategoryDto";

export default interface CreateCategoryDto extends Omit<CategoryDto, "id"> {}
