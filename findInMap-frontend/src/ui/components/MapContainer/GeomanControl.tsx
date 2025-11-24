import "@geoman-io/leaflet-geoman-free";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";
import L from "leaflet";
import React, { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";

import usePrevious from "../../commons/hooks/usePrevious";

interface GeomanControlProps {
    enabled: boolean;
    onAreaDrawn: (bounds: L.LatLngBounds | null) => void;
}

const GeomanControlComponent: React.FC<GeomanControlProps> = ({
    enabled,
    onAreaDrawn,
}) => {
    const map = useMap();
    const onAreaDrawnRef = useRef(onAreaDrawn);
    const previousEnabled = usePrevious(enabled);
    const handlersRegisteredRef = useRef(false);
    const handlersRef = useRef({
        handleCreate: (e: any) => {
            const layer = e.layer;
            const bounds = layer.getBounds ? layer.getBounds() : null;
            if (bounds) {
                onAreaDrawnRef.current(bounds);
            }
        },
        handleRemove: () => {
            onAreaDrawnRef.current(null);
        },
        handleEdit: (e: any) => {
            const layer = e.layer;
            const bounds = layer.getBounds ? layer.getBounds() : null;
            if (bounds) {
                onAreaDrawnRef.current(bounds);
            }
        },
    });

    useEffect(() => {
        onAreaDrawnRef.current = onAreaDrawn;
    }, [onAreaDrawn]);

    useEffect(() => {
        const { handleCreate, handleRemove, handleEdit } = handlersRef.current;

        if (!enabled) {
            if (handlersRegisteredRef.current) {
                map.off("pm:create", handleCreate);
                map.off("pm:remove", handleRemove);
                map.off("pm:edit", handleEdit);
                handlersRegisteredRef.current = false;
            }
            if (map.pm.controlsVisible()) {
                map.pm.removeControls();
            }
            map.eachLayer((layer: any) => {
                if (
                    layer instanceof L.Polygon ||
                    layer instanceof L.Rectangle ||
                    layer instanceof L.Circle
                ) {
                    map.removeLayer(layer);
                }
            });
            if (previousEnabled) {
                onAreaDrawnRef.current(null);
            }
            return;
        }

        if (!map.pm.controlsVisible()) {
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
        }

        if (!handlersRegisteredRef.current) {
            map.on("pm:create", handleCreate);
            map.on("pm:remove", handleRemove);
            map.on("pm:edit", handleEdit);
            handlersRegisteredRef.current = true;
        }

        return () => {
            if (handlersRegisteredRef.current) {
                map.off("pm:create", handleCreate);
                map.off("pm:remove", handleRemove);
                map.off("pm:edit", handleEdit);
                handlersRegisteredRef.current = false;
            }
            if (map.pm.controlsVisible()) {
                map.pm.removeControls();
            }
        };
    }, [map, enabled, previousEnabled]);

    return null;
};

export const GeomanControl = React.memo(
    GeomanControlComponent,
    (prevProps, nextProps) => {
        return prevProps.enabled === nextProps.enabled;
    },
);
