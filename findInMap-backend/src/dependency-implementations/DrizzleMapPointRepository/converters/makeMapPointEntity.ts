import { MapPointType } from "../../../core/commons/enums";
import { MapPointEntity } from "../../../core/entities/MapPointEntity";
import RawMapPoint from "../types/RawMapPointType";

export function makeMapPointEntity(mapPoint: RawMapPoint): MapPointEntity {
    return {
        id: mapPoint.id,
        long: mapPoint.long,
        lat: mapPoint.lat,
        type: mapPoint.type as MapPointType,
        date: mapPoint.date,
        created_at: mapPoint.createdAt,
        updated_at: mapPoint.updatedAt,
    };
}
