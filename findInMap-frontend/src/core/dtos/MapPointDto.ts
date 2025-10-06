import { MapPointType } from "../commons/enums";

export interface MapPointDto {
    id: number;
    long: number;
    lat: number;
    type: MapPointType;
    date: string;
    createdAt: Date;
}
