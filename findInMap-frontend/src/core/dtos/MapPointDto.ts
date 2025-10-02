import { MapPointType } from "../commons/enums";

export interface MapPointDto {
    id: number;
    // long
    x: number;
    // lat
    y: number;
    type: MapPointType;
    date: string;
    createdAt: Date;
}
