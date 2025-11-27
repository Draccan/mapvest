import { MapPointEntity } from "../entities/MapPointEntity";

export interface MapPointDto {
    id: string;
    long: number;
    lat: number;
    description?: string;
    date: string;
    categoryId?: string;
    createdAt: Date;
}

export function makeMapPointDto(mapPoint: MapPointEntity): MapPointDto {
    return {
        id: mapPoint.id,
        long: mapPoint.long,
        lat: mapPoint.lat,
        description: mapPoint.description,
        date: mapPoint.date,
        categoryId: mapPoint.category_id,
        createdAt: mapPoint.created_at,
    };
}
