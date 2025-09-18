import { MapPointDto } from "./MapPointDto";

export interface CreateMapPointDto
    extends Omit<MapPointDto, "id" | "createdAt"> {}

export interface CreateMapPointResponseDto {
    success: boolean;
    data?: MapPointDto;
    error?: string;
}
