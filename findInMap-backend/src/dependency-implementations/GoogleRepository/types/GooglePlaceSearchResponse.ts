export interface GooglePlace {
    displayName?: {
        text: string;
    };
    formattedAddress?: string;
    location: {
        latitude: number;
        longitude: number;
    };
}

export default interface GooglePlaceSearchResponse {
    places: GooglePlace[];
}
