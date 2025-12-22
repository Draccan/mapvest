import React, { useMemo } from "react";
import type { MapPointDto } from "../../../core/dtos/MapPointDto";
import getFormattedMessageWithScope from "../../../utils/getFormattedMessageWithScope";
import "./style.css";

const fm = getFormattedMessageWithScope("components.KpiCards");

interface KpiCardsProps {
    mapPoints: MapPointDto[];
}

export const KpiCards: React.FC<KpiCardsProps> = ({ mapPoints }) => {
    const kpis = useMemo(() => {
        const now = new Date();
        const total = mapPoints.length;
        const pending = mapPoints.filter(
            (p) => p.dueDate && new Date(p.dueDate) > now,
        ).length;
        const overdue = mapPoints.filter(
            (p) => p.dueDate && new Date(p.dueDate) <= now,
        ).length;
        const noDeadline = mapPoints.filter((p) => !p.dueDate).length;

        return { total, pending, overdue, noDeadline };
    }, [mapPoints]);

    return (
        <div className="c-kpi-cards">
            <div className="c-kpi-card">
                <h3>{fm("totalPoints")}</h3>
                <p className="c-kpi-value">{kpis.total}</p>
            </div>
            <div className="c-kpi-card">
                <h3>{fm("pendingPoints")}</h3>
                <p className="c-kpi-value">{kpis.pending}</p>
            </div>
            <div className="c-kpi-card c-kpi-warning">
                <h3>{fm("overduePoints")}</h3>
                <p className="c-kpi-value">{kpis.overdue}</p>
            </div>
            <div className="c-kpi-card">
                <h3>{fm("noDeadlinePoints")}</h3>
                <p className="c-kpi-value">{kpis.noDeadline}</p>
            </div>
        </div>
    );
};
