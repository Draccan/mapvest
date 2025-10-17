import { MapPointType } from "../commons/enums";

export interface MapPointEntity {
    id: number;
    long: number;
    lat: number;
    type: MapPointType;
    date: string;
    created_at: Date;
    updated_at: Date;
}
