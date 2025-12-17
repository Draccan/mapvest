import L from "leaflet";
import { Trash2, Edit } from "lucide-react";
import React, { useEffect } from "react";
import { FormattedDate, useIntl } from "react-intl";
import {
    MapContainer as LeafletMapContainer,
    TileLayer,
    CircleMarker,
    Popup,
    Marker,
    useMapEvents,
    useMap,
} from "react-leaflet";

import type { CategoryDto } from "../../../core/dtos/CategoryDto";
import { type MapPointDto } from "../../../core/dtos/MapPointDto";
import type { RouteDto } from "../../../core/dtos/RouteDto";
import getFormattedMessageWithScope from "../../../utils/getFormattedMessageWithScope";
import { Button } from "../Button";
import { GeomanControl } from "./GeomanControl";
import { PolylineWithArrows } from "./PolylineWithArrows";
import "./style.css";

const fm = getFormattedMessageWithScope("components.MapContainer");

interface MapContainerProps {
    mapPoints: MapPointDto[];
    categories: CategoryDto[];
    onMapClick: (lat: number, lng: number) => void;
    selectedCoordinates: { long: number; lat: number; zoom?: number } | null;
    onDeletePoint: (pointId: string) => void;
    onEditPoint: (point: MapPointDto) => void;
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

const DEFAULT_MARKER_COLOR = "#808080";

export const MapContainer: React.FC<MapContainerProps> = ({
    mapPoints,
    categories,
    onMapClick,
    selectedCoordinates,
    onDeletePoint,
    onEditPoint,
    deletingPointId,
    drawingEnabled = false,
    onAreaDrawn,
    optimizedRoute,
    startPoint,
    endPoint,
}) => {
    const getMarkerColor = (point: MapPointDto): string => {
        if (!point.categoryId) return DEFAULT_MARKER_COLOR;

        const category = categories.find((cat) => cat.id === point.categoryId);
        return category?.color || DEFAULT_MARKER_COLOR;
    };

    const getCategoryName = (point: MapPointDto): string | null => {
        if (!point.categoryId) return null;

        const category = categories.find((cat) => cat.id === point.categoryId);
        return category?.description || null;
    };

    const isDueSoon = (point: MapPointDto): boolean => {
        if (!point.dueDate) return false;

        const dueDate = new Date(point.dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        dueDate.setHours(0, 0, 0, 0);

        const diffTime = dueDate.getTime() - today.getTime();
        // 1000 * 60 * 60 * 24 => milliseconds in a day
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return diffDays <= 2;
    };

    const intl = useIntl();
    const deletePointLabel = intl.formatMessage({
        id: "components.MapContainer.deletePoint",
    });
    const editPointLabel = intl.formatMessage({
        id: "components.MapContainer.editPoint",
    });

    function deletePoint(e: React.MouseEvent, pointId: string) {
        // Warning: Prevent the map click event from firing
        e.stopPropagation();
        onDeletePoint(pointId);
    }

    function editPoint(e: React.MouseEvent, point: MapPointDto) {
        // Warning: Prevent the map click event from firing
        e.stopPropagation();
        onEditPoint(point);
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

    const optimezedRouteGeometry = optimizedRoute
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
                <PolylineWithArrows positions={optimezedRouteGeometry} />
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
                const markerColor = getMarkerColor(point);
                const categoryName = getCategoryName(point);
                const shouldBlink = isDueSoon(point);

                return (
                    <CircleMarker
                        key={`${point.id}-${point.categoryId || "no-category"}-${point.dueDate || "no-due"}`}
                        center={[point.lat, point.long]}
                        radius={8}
                        color={markerColor}
                        fillColor={markerColor}
                        fillOpacity={isSpecialPoint ? 0.3 : 1}
                        weight={shouldBlink ? 4 : 2}
                        className={shouldBlink ? "c-map-container-blink" : ""}
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
                                    <div className="c-map-container-popup-info">
                                        <div className="c-map-container-popup-left">
                                            <div>
                                                <strong>
                                                    {fm("description")}:
                                                </strong>{" "}
                                                {point.description || "/"}
                                            </div>
                                            <div>
                                                <strong>{fm("date")}:</strong>{" "}
                                                <FormattedDate
                                                    value={new Date(point.date)}
                                                    year="numeric"
                                                    month="numeric"
                                                    day="numeric"
                                                />
                                            </div>
                                            {point.dueDate && (
                                                <div>
                                                    <strong>
                                                        {fm("dueDate")}:
                                                    </strong>{" "}
                                                    <FormattedDate
                                                        value={
                                                            new Date(
                                                                point.dueDate,
                                                            )
                                                        }
                                                        year="numeric"
                                                        month="numeric"
                                                        day="numeric"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                        {categoryName && (
                                            <div className="c-map-container-popup-right">
                                                <div
                                                    className="c-map-container-category-tag"
                                                    style={{
                                                        borderColor:
                                                            markerColor,
                                                    }}
                                                >
                                                    {categoryName}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="c-map-container-actions">
                                        <Button
                                            kind="primary"
                                            size="icon"
                                            onClick={(e) => {
                                                editPoint(e, point);
                                            }}
                                            title={editPointLabel}
                                            aria-label={editPointLabel}
                                            fullWidth={false}
                                            className="c-map-container-edit-btn"
                                        >
                                            <Edit size={18} />
                                        </Button>
                                        <Button
                                            kind="danger"
                                            size="icon"
                                            onClick={(e) =>
                                                deletePoint(e, point.id)
                                            }
                                            title={deletePointLabel}
                                            aria-label={deletePointLabel}
                                            disabled={
                                                deletingPointId === point.id
                                            }
                                            loading={
                                                deletingPointId === point.id
                                            }
                                            fullWidth={false}
                                            className="c-map-container-delete-btn"
                                        >
                                            <Trash2 size={18} />
                                        </Button>
                                    </div>
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
