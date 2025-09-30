import { MapPointEntity } from "../../../core/entities/MapPointEntity";
import { MapPoint } from "../../../db/schema";
import { MapPointType } from "../../../core/commons/enums";

interface RawMapPoint extends Omit<MapPoint, "location"> {
    x: number;
    y: number;
}

export const makeMapPointEntity = (mapPoint: RawMapPoint): MapPointEntity => {
    return {
        id: mapPoint.id,
        x: mapPoint.x,
        y: mapPoint.y,
        type: mapPoint.type as MapPointType,
        date: mapPoint.date,
        created_at: mapPoint.createdAt,
        updated_at: mapPoint.updatedAt,
    };
};
