import { CategoryDto } from "./CategoryDto";

export default interface UpdateCategoryDto extends Omit<CategoryDto, "id"> {}
