import L from "leaflet";

import type { MapPointDto } from "src/core/dtos/MapPointDto";

export default function getPointsInBounds(
    points: MapPointDto[],
    bounds: L.LatLngBounds,
): MapPointDto[] {
    return points.filter((point) => {
        const latLng = L.latLng(point.lat, point.long);
        return bounds.contains(latLng);
    });
}
