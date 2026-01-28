import { MapPointEntity } from "../entities/MapPointEntity";

export default interface MapPointDto {
    id: string;
    long: number;
    lat: number;
    description?: string;
    // YYYY-MM-DD format
    date: string;
    // YYYY-MM-DD format
    dueDate?: string;
    notes?: string;
    categoryId?: string;
    createdAt: Date;
}

export function makeMapPointDto(mapPoint: MapPointEntity): MapPointDto {
    return {
        id: mapPoint.id,
        long: mapPoint.long,
        lat: mapPoint.lat,
        description: mapPoint.description,
        date: mapPoint.date,
        dueDate: mapPoint.due_date,
        notes: mapPoint.notes,
        categoryId: mapPoint.category_id,
        createdAt: mapPoint.created_at,
    };
}
