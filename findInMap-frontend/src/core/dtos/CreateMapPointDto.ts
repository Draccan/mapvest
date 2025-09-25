import { type MapPointDto } from "./MapPointDto";

export interface CreateMapPointDto
    extends Omit<MapPointDto, "id" | "createdAt"> {}
