import React from "react";

import { MapPointType } from "../../../core/commons/enums";
import { type MapPointDto } from "../../../core/dtos/MapPointDto";
import getFormattedMessageWithScope from "../../../utils/getFormattedMessageWithScope";
import "./style.css";

const fm = getFormattedMessageWithScope("components.AreaAnalysis");

interface AreaAnalysisProps {
    pointsInArea: MapPointDto[];
}

export const AreaAnalysis: React.FC<AreaAnalysisProps> = ({ pointsInArea }) => {
    const getTypeCount = (type: MapPointType): number => {
        return pointsInArea.filter((point) => point.type === type).length;
    };

    const sortedByDate = [...pointsInArea].sort(
        (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return (
        <div className="c-area-analysis">
            <h2>{fm("title")}</h2>

            <div className="c-area-analysis-section">
                <h3>{fm("summary")}</h3>
                <div className="c-area-analysis-stat-item">
                    <span className="c-area-analysis-stat-label">
                        {fm("totalPoints")}:
                    </span>
                    <span className="c-area-analysis-stat-value">
                        {pointsInArea.length}
                    </span>
                </div>
            </div>

            <div className="c-area-analysis-section">
                <h3>{fm("byType")}</h3>
                <div className="c-area-analysis-stat-item">
                    <span className="c-area-analysis-stat-label">
                        {fm("types.THEFT")}:
                    </span>
                    <span className="c-area-analysis-stat-value c-area-analysis-stat-theft">
                        {getTypeCount(MapPointType.Theft)}
                    </span>
                </div>
                <div className="c-area-analysis-stat-item">
                    <span className="c-area-analysis-stat-label">
                        {fm("types.AGGRESSION")}:
                    </span>
                    <span className="c-area-analysis-stat-value c-area-analysis-stat-aggression">
                        {getTypeCount(MapPointType.Aggression)}
                    </span>
                </div>
                <div className="c-area-analysis-stat-item">
                    <span className="c-area-analysis-stat-label">
                        {fm("types.ROBBERY")}:
                    </span>
                    <span className="c-area-analysis-stat-value c-area-analysis-stat-robbery">
                        {getTypeCount(MapPointType.Robbery)}
                    </span>
                </div>
            </div>

            {sortedByDate.length > 0 && (
                <div className="c-area-analysis-section">
                    <h3>{fm("recentPoints")}</h3>
                    <div className="c-points-list">
                        {sortedByDate.slice(0, 5).map((point) => (
                            <div
                                key={point.id}
                                className="c-area-analysis-point-item"
                            >
                                <span className="c-area-analysis-point-type">
                                    {fm(`types.${point.type}`)}
                                </span>
                                <span className="c-area-analysis-point-date">
                                    {point.date}
                                </span>
                            </div>
                        ))}
                        {sortedByDate.length > 5 && (
                            <div className="c-area-analysis-more-points">
                                {fm({
                                    id: "morePoints",
                                    values: { count: sortedByDate.length - 5 },
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {pointsInArea.length === 0 && (
                <div className="c-area-analysis-empty-state">
                    {fm("noPoints")}
                </div>
            )}
        </div>
    );
};
