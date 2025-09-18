import React from "react";
import {
    MapContainer as LeafletMapContainer,
    TileLayer,
    CircleMarker,
    Popup,
    Marker,
    useMapEvents,
} from "react-leaflet";

import { MapPointType } from "../../../core/commons/enums";
import { type MapPointDto } from "../../../core/dtos/MapPointDto";

interface MapContainerProps {
    mapPoints: MapPointDto[];
    onMapClick: (lat: number, lng: number) => void;
    selectedCoordinates: { x: number; y: number } | null;
}

const MapClickHandler: React.FC<{
    onMapClick: (lng: number, lat: number) => void;
}> = ({ onMapClick }) => {
    useMapEvents({
        click: (e) => {
            onMapClick(e.latlng.lng, e.latlng.lat);
        },
    });
    return null;
};

const getMarkerColor = (type: MapPointType): string => {
    switch (type) {
        case MapPointType.Theft:
            return "#ff6b6b";
        case MapPointType.Aggression:
            return "#feca57";
        case MapPointType.Robbery:
            return "#ff9ff3";
        default:
            return "#74b9ff";
    }
};

export const MapContainer: React.FC<MapContainerProps> = ({
    mapPoints,
    onMapClick,
    selectedCoordinates,
}) => {
    return (
        <LeafletMapContainer
            center={[41.9028, 12.4964]}
            zoom={13}
            style={{ height: "500px", width: "100%" }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapClickHandler onMapClick={onMapClick} />
            {mapPoints.map((point) => (
                <CircleMarker
                    key={point.id}
                    center={[point.x, point.y]}
                    radius={8}
                    color={getMarkerColor(point.type)}
                    fillColor={getMarkerColor(point.type)}
                    fillOpacity={1}
                >
                    <Popup>
                        <div>
                            <strong>Type:</strong> {point.type}
                            <br />
                            <strong>Date:</strong> {point.date}
                            <br />
                            <strong>Coordinate:</strong> {point.x.toFixed(4)},{" "}
                            {point.y.toFixed(4)}
                        </div>
                    </Popup>
                </CircleMarker>
            ))}
            {selectedCoordinates && (
                <Marker
                    position={[selectedCoordinates.y, selectedCoordinates.x]}
                >
                    <Popup>Selected Point</Popup>
                </Marker>
            )}
        </LeafletMapContainer>
    );
};
