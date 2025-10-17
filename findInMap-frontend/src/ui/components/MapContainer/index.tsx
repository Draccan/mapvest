import React, { useEffect } from "react";
import {
    MapContainer as LeafletMapContainer,
    TileLayer,
    CircleMarker,
    Popup,
    Marker,
    useMapEvents,
    useMap,
} from "react-leaflet";

import { MapPointType } from "../../../core/commons/enums";
import { type MapPointDto } from "../../../core/dtos/MapPointDto";
import getFormattedMessageWithScope from "../../../utils/getFormattedMessageWithScope";

const fm = getFormattedMessageWithScope("components.MapContainer");

interface MapContainerProps {
    mapPoints: MapPointDto[];
    onMapClick: (lat: number, lng: number) => void;
    selectedCoordinates: { long: number; lat: number; zoom?: number } | null;
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

const MapController: React.FC<{
    selectedCoordinates: { long: number; lat: number; zoom?: number } | null;
}> = ({ selectedCoordinates }) => {
    const map = useMap();

    useEffect(() => {
        if (selectedCoordinates) {
            const zoom = selectedCoordinates.zoom || 3;
            map.setView(
                [selectedCoordinates.lat, selectedCoordinates.long],
                zoom,
            );
        }
    }, [selectedCoordinates, map]);

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
            zoom={3}
            style={{ height: "100%", width: "100%" }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapClickHandler onMapClick={onMapClick} />
            <MapController selectedCoordinates={selectedCoordinates} />
            {mapPoints.map((point) => (
                <CircleMarker
                    key={point.id}
                    center={[point.lat, point.long]}
                    radius={8}
                    color={getMarkerColor(point.type)}
                    fillColor={getMarkerColor(point.type)}
                    fillOpacity={1}
                    eventHandlers={{
                        click: (e) => {
                            e.originalEvent.stopPropagation();
                            onMapClick(point.long, point.lat);
                        },
                    }}
                >
                    <Popup>
                        <div>
                            <strong>{fm("type")}:</strong>{" "}
                            {fm(`types.${point.type}`)}
                            <br />
                            <strong>{fm("date")}:</strong> {point.date}
                            <br />
                            <strong>{fm("coordinates")}:</strong>{" "}
                            {`Long: ${point.long.toFixed(4)}, Lat: ${point.lat.toFixed(4)}`}
                        </div>
                    </Popup>
                </CircleMarker>
            ))}
            {selectedCoordinates && (
                <Marker
                    position={[
                        selectedCoordinates.lat,
                        selectedCoordinates.long,
                    ]}
                >
                    <Popup>{fm("selectedPoint")}</Popup>
                </Marker>
            )}
        </LeafletMapContainer>
    );
};
