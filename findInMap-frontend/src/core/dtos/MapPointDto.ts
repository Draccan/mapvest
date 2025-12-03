export interface MapPointDto {
    id: string;
    long: number;
    lat: number;
    description?: string;
    // date in YYYY-MM-DD format
    date: string;
    // timestamp in ISO format
    createdAt: string;
    categoryId?: string;
}
