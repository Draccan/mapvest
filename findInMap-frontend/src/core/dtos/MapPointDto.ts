export interface MapPointDto {
    id: string;
    long: number;
    lat: number;
    description?: string;
    date: string;
    // timestamp in ISO format
    createdAt: string;
}
