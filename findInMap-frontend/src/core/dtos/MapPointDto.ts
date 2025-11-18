import { MapPointType } from "../commons/enums";

export interface MapPointDto {
    id: string;
    long: number;
    lat: number;
    type: MapPointType;
    date: string;
    // timestamp in ISO format
    createdAt: string;
}
