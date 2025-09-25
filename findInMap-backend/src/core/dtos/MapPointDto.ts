import { MapPointType } from "../commons/enums";
import { MapPointEntity } from "../entities/MapPointEntity";

export interface MapPointDto {
    id: number;
    x: number;
    y: number;
    type: MapPointType;
    date: string;
    createdAt: Date;
}

export function makeMapPointDto(mapPoint: MapPointEntity): MapPointDto {
    return {
        id: mapPoint.id,
        x: mapPoint.x,
        y: mapPoint.y,
        type: mapPoint.type,
        date: mapPoint.date,
        createdAt: mapPoint.created_at,
    };
}
