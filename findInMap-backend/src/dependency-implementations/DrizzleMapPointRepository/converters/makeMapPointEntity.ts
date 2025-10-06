import { MapPointType } from "../../../core/commons/enums";
import { MapPointEntity } from "../../../core/entities/MapPointEntity";
import { MapPoint } from "../../../db/schema";

interface RawMapPoint extends Omit<MapPoint, "location"> {
    long: number;
    lat: number;
}

export const makeMapPointEntity = (mapPoint: RawMapPoint): MapPointEntity => {
    return {
        id: mapPoint.id,
        long: mapPoint.long,
        lat: mapPoint.lat,
        type: mapPoint.type as MapPointType,
        date: mapPoint.date,
        created_at: mapPoint.createdAt,
        updated_at: mapPoint.updatedAt,
    };
};
