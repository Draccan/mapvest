import L from "leaflet";
import "leaflet-polylinedecorator";
import { useEffect } from "react";
import { useMap } from "react-leaflet";

export const PolylineWithArrows: React.FC<{ positions: L.LatLng[] }> = ({
    positions,
}) => {
    const map = useMap();

    useEffect(() => {
        if (positions.length === 0) return;

        const polyline = L.polyline(positions, {
            color: "#2563eb",
            weight: 4,
            opacity: 0.7,
        }).addTo(map);

        const decorator = L.polylineDecorator(polyline, {
            patterns: [
                {
                    offset: 25,
                    repeat: 100,
                    symbol: L.Symbol.arrowHead({
                        pixelSize: 12,
                        polygon: false,
                        pathOptions: {
                            stroke: true,
                            color: "#2563eb",
                            weight: 2,
                        },
                    }),
                },
            ],
        }).addTo(map);

        return () => {
            map.removeLayer(polyline);
            map.removeLayer(decorator);
        };
    }, [map, positions]);

    return null;
};
