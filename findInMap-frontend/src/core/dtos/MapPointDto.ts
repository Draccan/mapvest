import { MapPointType } from "../commons/enums";

export interface MapPointDto {
    id: number;
    x: number;
    y: number;
    type: MapPointType;
    date: string;
    createdAt: Date;
}

export interface MapPointsResponseDto {
    success: boolean;
    data: MapPointDto[];
    error?: string;
}
