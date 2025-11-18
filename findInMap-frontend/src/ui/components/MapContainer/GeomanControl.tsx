import "@geoman-io/leaflet-geoman-free";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";
import L from "leaflet";
import { useEffect } from "react";
import { useMap } from "react-leaflet";

interface GeomanControlProps {
    enabled: boolean;
    onAreaDrawn: (bounds: L.LatLngBounds | null) => void;
}

export const GeomanControl: React.FC<GeomanControlProps> = ({
    enabled,
    onAreaDrawn,
}) => {
    const map = useMap();

    useEffect(() => {
        if (!enabled) {
            map.pm.removeControls();
            map.eachLayer((layer: any) => {
                if (
                    layer instanceof L.Polygon ||
                    layer instanceof L.Rectangle ||
                    layer instanceof L.Circle
                ) {
                    map.removeLayer(layer);
                }
            });
            onAreaDrawn(null);
            return;
        }

        map.pm.addControls({
            position: "topleft",
            drawCircle: true,
            drawCircleMarker: false,
            drawPolyline: false,
            drawRectangle: true,
            drawPolygon: true,
            drawMarker: false,
            editMode: false,
            dragMode: false,
            cutPolygon: false,
            removalMode: true,
            drawText: false,
        });

        const handleCreate = (e: any) => {
            const layer = e.layer;
            const bounds = layer.getBounds ? layer.getBounds() : null;
            if (bounds) {
                onAreaDrawn(bounds);
            }
        };

        const handleRemove = () => {
            onAreaDrawn(null);
        };

        const handleEdit = (e: any) => {
            const layer = e.layer;
            const bounds = layer.getBounds ? layer.getBounds() : null;
            if (bounds) {
                onAreaDrawn(bounds);
            }
        };

        map.on("pm:create", handleCreate);
        map.on("pm:remove", handleRemove);
        map.on("pm:edit", handleEdit);

        return () => {
            map.pm.removeControls();
            map.off("pm:create", handleCreate);
            map.off("pm:remove", handleRemove);
            map.off("pm:edit", handleEdit);
        };
    }, [map, enabled, onAreaDrawn]);

    return null;
};
