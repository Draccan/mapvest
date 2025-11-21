import compact from "lodash-es/compact";
import uniq from "lodash-es/uniq";
import { Navigation } from "lucide-react";
import React from "react";
import { useIntl } from "react-intl";

import { type MapPointDto } from "../../../core/dtos/MapPointDto";
import getFormattedMessageWithScope from "../../../utils/getFormattedMessageWithScope";
import { Button } from "../Button";
import "./style.css";

const fm = getFormattedMessageWithScope("components.AreaAnalysis");

interface AreaAnalysisProps {
    pointsInArea: MapPointDto[];
    startPoint: MapPointDto | null;
    endPoint: MapPointDto | null;
    onStartPointSelect: (point: MapPointDto) => void;
    onEndPointSelect: (point: MapPointDto) => void;
    onOptimizeRoute: () => void;
    isOptimizingRoute: boolean;
}

export const AreaAnalysis: React.FC<AreaAnalysisProps> = ({
    pointsInArea,
    startPoint,
    endPoint,
    onStartPointSelect,
    onEndPointSelect,
    onOptimizeRoute,
    isOptimizingRoute,
}) => {
    const intl = useIntl();

    const getTypeCount = (type?: string): number => {
        return pointsInArea.filter((point) => point.type === type).length;
    };

    const selectStartPoint = (e: any) => {
        const point = pointsInArea.find((p) => p.id === e.target.value)!;
        onStartPointSelect(point);
    };

    const selectEndPoint = (e: any) => {
        const point = pointsInArea.find((p) => p.id === e.target.value)!;
        onEndPointSelect(point);
    };

    const sortedByDate = [...pointsInArea].sort(
        (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    const types = uniq(compact(pointsInArea.map((p) => p.type)));

    const canCalculateOptimizedRoute =
        startPoint && endPoint && pointsInArea.length >= 2;
    const showRoutePlanning = pointsInArea.length > 1;

    return (
        <div className="c-area-analysis">
            <div className="c-area-analysis-header">
                <h2>{fm("title")}</h2>
                {showRoutePlanning && (
                    <Button
                        kind="primary"
                        size="icon"
                        onClick={onOptimizeRoute}
                        disabled={
                            !canCalculateOptimizedRoute || isOptimizingRoute
                        }
                        loading={isOptimizingRoute}
                        title={intl.formatMessage({
                            id: "components.AreaAnalysis.calculateOptimizedRoute",
                        })}
                        aria-label={intl.formatMessage({
                            id: "components.AreaAnalysis.calculateOptimizedRoute",
                        })}
                    >
                        <Navigation size={20} />
                    </Button>
                )}
            </div>

            {showRoutePlanning && (
                <div className="c-area-analysis-section">
                    <h3>{fm("routePlanning")}</h3>
                    <div className="c-area-analysis-route-selection">
                        <div className="c-area-analysis-route-item">
                            <label>{fm("startPoint")}:</label>
                            <select
                                value={startPoint?.id || ""}
                                onChange={selectStartPoint}
                                className="c-area-analysis-select"
                            >
                                <option value="">{fm("selectPoint")}</option>
                                {pointsInArea.map((point) => (
                                    <option key={point.id} value={point.id}>
                                        {point.type} - {point.date}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="c-area-analysis-route-item">
                            <label>{fm("endPoint")}:</label>
                            <select
                                value={endPoint?.id || ""}
                                onChange={selectEndPoint}
                                className="c-area-analysis-select"
                            >
                                <option value="">{fm("selectPoint")}</option>
                                {pointsInArea.map((point) => (
                                    <option key={point.id} value={point.id}>
                                        {point.type} - {point.date}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            )}

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
                {types.map((type: string, index) => (
                    <div key={index} className="c-area-analysis-stat-item">
                        <span className="c-area-analysis-stat-label">
                            {type}
                        </span>
                        <span className="c-area-analysis-stat-value c-area-analysis-stat-type">
                            {getTypeCount(type)}
                        </span>
                    </div>
                ))}
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
                                    {point.type}
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
