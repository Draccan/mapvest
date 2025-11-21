import L from "leaflet";
import { Trash2 } from "lucide-react";
import React, { useEffect } from "react";
import { useIntl } from "react-intl";
import {
    MapContainer as LeafletMapContainer,
    TileLayer,
    CircleMarker,
    Popup,
    Marker,
    Polyline,
    useMapEvents,
    useMap,
} from "react-leaflet";

import { type MapPointDto } from "../../../core/dtos/MapPointDto";
import type { RouteDto } from "../../../core/dtos/RouteDto";
import getFormattedMessageWithScope from "../../../utils/getFormattedMessageWithScope";
import { Button } from "../Button";
import { GeomanControl } from "./GeomanControl";
import "./style.css";

const fm = getFormattedMessageWithScope("components.MapContainer");

interface MapContainerProps {
    mapPoints: MapPointDto[];
    onMapClick: (lat: number, lng: number) => void;
    selectedCoordinates: { long: number; lat: number; zoom?: number } | null;
    onDeletePoint: (pointId: string) => void;
    deletingPointId?: string | null;
    drawingEnabled?: boolean;
    onAreaDrawn: (bounds: L.LatLngBounds | null) => void;
    optimizedRoute?: RouteDto | null;
    startPoint?: MapPointDto | null;
    endPoint?: MapPointDto | null;
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

const getMarkerColor = (type?: string): string => {
    switch (type) {
        case "Theft":
            return "#ff6b6b";
        case "Aggression":
            return "#feca57";
        case "Robbery":
            return "#ff9ff3";
        default:
            return "#74b9ff";
    }
};

export const MapContainer: React.FC<MapContainerProps> = ({
    mapPoints,
    onMapClick,
    selectedCoordinates,
    onDeletePoint,
    deletingPointId,
    drawingEnabled = false,
    onAreaDrawn,
    optimizedRoute,
    startPoint,
    endPoint,
}) => {
    const intl = useIntl();
    const deletePointLabel = intl.formatMessage({
        id: "components.MapContainer.deletePoint",
    });

    function deletePoint(e: React.MouseEvent, pointId: string) {
        // Warning: Prevent the map click event from firing
        e.stopPropagation();
        onDeletePoint(pointId);
    }

    const getWaypointIndex = (point: MapPointDto): number | null => {
        if (!optimizedRoute) return null;

        const pointLatLng = L.latLng(point.lat, point.long);

        const waypoint = optimizedRoute.waypoints.find((wp) => {
            const wpLatLng = L.latLng(wp.location[0], wp.location[1]);
            return pointLatLng.equals(wpLatLng);
        });

        return waypoint ? waypoint.waypointIndex : null;
    };

    const isStartOrEndPoint = (point: MapPointDto): boolean => {
        return point.id === startPoint?.id || point.id === endPoint?.id;
    };

    const optimezedRouteLeafletGeometry = optimizedRoute
        ? optimizedRoute.geometry.map((coord) => L.latLng(coord[0], coord[1]))
        : [];

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
            {!drawingEnabled && <MapClickHandler onMapClick={onMapClick} />}
            <MapController selectedCoordinates={selectedCoordinates} />
            <GeomanControl enabled={drawingEnabled} onAreaDrawn={onAreaDrawn} />
            {optimizedRoute && (
                <Polyline
                    positions={optimezedRouteLeafletGeometry}
                    color="#2563eb"
                    weight={4}
                    opacity={0.7}
                />
            )}
            {startPoint && (
                <Marker
                    position={[startPoint.lat, startPoint.long]}
                    icon={L.divIcon({
                        className: "c-map-container-start-marker",
                        html: '<div class="c-map-container-marker-icon c-map-container-marker-start">S</div>',
                        iconSize: [32, 32],
                        iconAnchor: [16, 16],
                    })}
                >
                    <Popup>{fm("startPoint")}</Popup>
                </Marker>
            )}
            {endPoint && (
                <Marker
                    position={[endPoint.lat, endPoint.long]}
                    icon={L.divIcon({
                        className: "c-map-container-end-marker",
                        html: '<div class="c-map-container-marker-icon c-map-container-marker-end">E</div>',
                        iconSize: [32, 32],
                        iconAnchor: [16, 16],
                    })}
                >
                    <Popup>{fm("endPoint")}</Popup>
                </Marker>
            )}
            {mapPoints.map((point) => {
                const waypointIndex = getWaypointIndex(point);
                const isSpecialPoint = isStartOrEndPoint(point);

                return (
                    <CircleMarker
                        key={point.id}
                        center={[point.lat, point.long]}
                        radius={8}
                        color={getMarkerColor(point.type)}
                        fillColor={getMarkerColor(point.type)}
                        fillOpacity={isSpecialPoint ? 0.3 : 1}
                        eventHandlers={{
                            click: (e) => {
                                e.originalEvent.stopPropagation();
                                onMapClick(point.long, point.lat);
                            },
                        }}
                    >
                        <Popup>
                            <div className="c-map-container-popup">
                                <div className="c-map-container-popup-content">
                                    {waypointIndex !== null && (
                                        <div className="c-map-container-waypoint-badge">
                                            {fm("stop")} #{waypointIndex}
                                        </div>
                                    )}
                                    <div>
                                        <strong>{fm("type")}:</strong>{" "}
                                        {point.type || "/"}
                                        <br />
                                        <strong>{fm("date")}:</strong>{" "}
                                        {point.date}
                                        <br />
                                        <strong>
                                            {fm("coordinates")}:
                                        </strong>{" "}
                                        {`Long: ${point.long.toFixed(4)}, Lat: ${point.lat.toFixed(4)}`}
                                    </div>
                                    <Button
                                        kind="danger"
                                        size="icon"
                                        onClick={(e) =>
                                            deletePoint(e, point.id)
                                        }
                                        title={deletePointLabel}
                                        aria-label={deletePointLabel}
                                        disabled={deletingPointId === point.id}
                                        loading={deletingPointId === point.id}
                                        fullWidth={false}
                                        className="c-map-container-delete-btn"
                                    >
                                        <Trash2 size={18} />
                                    </Button>
                                </div>
                            </div>
                        </Popup>
                    </CircleMarker>
                );
            })}
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
