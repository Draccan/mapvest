import { MapPointType } from "../commons/enums";
import { MapPointEntity } from "../entities/MapPointEntity";

export interface MapPointDto {
    id: string;
    long: number;
    lat: number;
    type: MapPointType;
    date: string;
    createdAt: Date;
}

export function makeMapPointDto(mapPoint: MapPointEntity): MapPointDto {
    return {
        id: mapPoint.id,
        long: mapPoint.long,
        lat: mapPoint.lat,
        type: mapPoint.type,
        date: mapPoint.date,
        createdAt: mapPoint.created_at,
    };
}
