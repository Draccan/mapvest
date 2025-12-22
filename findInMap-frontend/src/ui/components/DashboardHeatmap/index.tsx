import React, { useMemo } from "react";
import { MapContainer as LeafletMapContainer, TileLayer } from "react-leaflet";
import { HeatmapLayer } from "react-leaflet-heatmap-layer-v3";

import type { MapPointDto } from "../../../core/dtos/MapPointDto";
import getFormattedMessageWithScope from "../../../utils/getFormattedMessageWithScope";
import "./style.css";

const fm = getFormattedMessageWithScope("components.DashboardHeatmap");

interface DashboardHeatmapProps {
    mapPoints: MapPointDto[];
}

export const DashboardHeatmap: React.FC<DashboardHeatmapProps> = ({
    mapPoints,
}) => {
    const points = useMemo(() => {
        return mapPoints.map((point) => ({
            lat: point.lat,
            lng: point.long,
            intensity: 1,
        }));
    }, [mapPoints]);

    const center: [number, number] = useMemo(() => {
        if (mapPoints.length === 0) return [41.9028, 12.4964];

        const avgLat =
            mapPoints.reduce((sum, point) => sum + point.lat, 0) /
            mapPoints.length;
        const avgLng =
            mapPoints.reduce((sum, point) => sum + point.long, 0) /
            mapPoints.length;

        return [avgLat, avgLng];
    }, [mapPoints]);

    return (
        <div className="c-dashboard-heatmap">
            <h3>{fm("heatmap")}</h3>
            {points.length > 0 ? (
                <LeafletMapContainer
                    center={center}
                    zoom={6}
                    style={{
                        height: "500px",
                        width: "100%",
                        borderRadius: "12px",
                    }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <HeatmapLayer
                        points={points}
                        longitudeExtractor={(point: any) => point.lng}
                        latitudeExtractor={(point: any) => point.lat}
                        intensityExtractor={(point: any) => point.intensity}
                        radius={25}
                        blur={15}
                        maxZoom={17}
                        gradient={{
                            0.0: "blue",
                            0.5: "yellow",
                            1.0: "red",
                        }}
                    />
                </LeafletMapContainer>
            ) : (
                <p className="c-dashboard-heatmap-no-data">{fm("noData")}</p>
            )}
        </div>
    );
};
