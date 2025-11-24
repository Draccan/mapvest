interface WaypointDto {
    location: [number, number];
    waypointIndex: number;
    originalIndex: number;
}

export interface RouteDto {
    waypoints: WaypointDto[];
    distance: number;
    duration: number;
    geometry: Array<[number, number]>;
}
