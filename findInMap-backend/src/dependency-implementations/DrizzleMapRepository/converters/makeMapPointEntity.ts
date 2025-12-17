import { MapPointEntity } from "../../../core/entities/MapPointEntity";
import RawMapPoint from "../types/RawMapPointType";

export function makeMapPointEntity(mapPoint: RawMapPoint): MapPointEntity {
    return {
        id: mapPoint.id,
        long: mapPoint.long,
        lat: mapPoint.lat,
        description: mapPoint.description ? mapPoint.description : undefined,
        date: mapPoint.date,
        due_date: mapPoint.dueDate ? mapPoint.dueDate : undefined,
        category_id: mapPoint.categoryId ? mapPoint.categoryId : undefined,
        created_at: mapPoint.createdAt,
        updated_at: mapPoint.updatedAt,
    };
}
