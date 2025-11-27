export interface MapPointEntity {
    id: string;
    long: number;
    lat: number;
    description?: string;
    date: string;
    category_id?: string;
    created_at: Date;
    updated_at: Date;
}
