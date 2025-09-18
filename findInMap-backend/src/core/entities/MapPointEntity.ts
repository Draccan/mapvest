import { MapPointType } from "../commons/enums";

export interface MapPointEntity {
    id: number;
    x: number;
    y: number;
    type: MapPointType;
    date: string;
    created_at: Date;
    updated_at: Date;
}
