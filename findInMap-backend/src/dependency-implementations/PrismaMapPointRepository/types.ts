import { MapPointType } from "../../core/commons/enums";

export interface MapPoint {
    id: number;
    longitude: number;
    latitude: number;
    type: MapPointType;
    date: string;
    created_at: Date;
    updated_at: Date;
}
