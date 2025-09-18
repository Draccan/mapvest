import { MapPointEntity } from "../../../core/entities/MapPointEntity";
import { MapPoint } from "../types";

export default function makeMapPointEntity(mapPoint: MapPoint): MapPointEntity {
    return {
        id: mapPoint.id,
        x: mapPoint.latitude,
        y: mapPoint.longitude,
        type: mapPoint.type,
        date: mapPoint.date,
        created_at: mapPoint.created_at,
        updated_at: mapPoint.updated_at,
    };
}
