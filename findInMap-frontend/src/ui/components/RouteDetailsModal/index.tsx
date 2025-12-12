import React from "react";

import { type CategoryDto } from "../../../core/dtos/CategoryDto";
import { type MapPointDto } from "../../../core/dtos/MapPointDto";
import { type RouteDto } from "../../../core/dtos/RouteDto";
import getFormattedMessageWithScope from "../../../utils/getFormattedMessageWithScope";
import { Modal } from "../Modal";
import "./style.css";

const fm = getFormattedMessageWithScope("components.RouteDetailsModal");

interface RouteDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    route: RouteDto;
    points: MapPointDto[];
    categories: CategoryDto[];
}

export const RouteDetailsModal: React.FC<RouteDetailsModalProps> = ({
    isOpen,
    onClose,
    route,
    points,
    categories,
}) => {
    const orderedPoints = route.waypoints
        .sort((a, b) => a.waypointIndex - b.waypointIndex)
        .map((wp) => {
            const point = points[wp.originalIndex] || undefined;
            return point;
        })
        .filter((p) => p !== undefined);

    const getCategoryForPoint = (point: MapPointDto) => {
        if (!point.categoryId) return null;
        return categories.find((cat) => cat.id === point.categoryId) || null;
    };

    const formatDistance = (meters: number) => {
        if (meters < 1000) {
            return `${Math.round(meters)} m`;
        }
        return `${(meters / 1000).toFixed(1)} km`;
    };

    const formatDuration = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        if (hours > 0) {
            return `${hours}h ${minutes}min`;
        }
        return `${minutes}min`;
    };

    const totalStops = route.waypoints.length;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={fm("title")}>
            <div className="c-route-details">
                <div className="c-route-details-summary">
                    <div className="c-route-details-summary-item">
                        <span className="c-route-details-summary-label">
                            {fm("totalDistance")}:
                        </span>
                        <span className="c-route-details-summary-value">
                            {formatDistance(route.distance)}
                        </span>
                    </div>
                    <div className="c-route-details-summary-item">
                        <span className="c-route-details-summary-label">
                            {fm("totalDuration")}:
                        </span>
                        <span className="c-route-details-summary-value">
                            {formatDuration(route.duration)}
                        </span>
                    </div>
                    <div className="c-route-details-summary-item">
                        <span className="c-route-details-summary-label">
                            {fm("totalStops")}:
                        </span>
                        <span className="c-route-details-summary-value">
                            {totalStops}
                        </span>
                    </div>
                </div>

                <div className="c-route-details-list">
                    {orderedPoints.map((point, index) => {
                        const category = getCategoryForPoint(point);
                        return (
                            <div
                                key={point.id}
                                className="c-route-details-item"
                            >
                                <div className="c-route-details-item-number">
                                    {index + 1}
                                </div>
                                <div className="c-route-details-item-content">
                                    <div className="c-route-details-item-description">
                                        {point.description ||
                                            fm("noDescription")}
                                    </div>
                                    <div className="c-route-details-item-meta">
                                        <span className="c-route-details-item-date">
                                            {point.date}
                                        </span>
                                        {category && (
                                            <span
                                                className="c-route-details-item-category"
                                                style={{
                                                    borderColor: category.color,
                                                    color: category.color,
                                                }}
                                            >
                                                {category.description}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </Modal>
    );
};
