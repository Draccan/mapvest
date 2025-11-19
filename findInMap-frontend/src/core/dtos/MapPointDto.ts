export interface MapPointDto {
    id: string;
    long: number;
    lat: number;
    type?: string;
    date: string;
    // timestamp in ISO format
    createdAt: string;
}
