import React, { useMemo } from "react";
import { useIntl } from "react-intl";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

import type { MapPointDto } from "../../../core/dtos/MapPointDto";
import getFormattedMessageWithScope from "../../../utils/getFormattedMessageWithScope";
import "./style.css";

const fm = getFormattedMessageWithScope("components.TimelineChart");

interface TimelineChartProps {
    mapPoints: MapPointDto[];
}

export const TimelineChart: React.FC<TimelineChartProps> = ({ mapPoints }) => {
    const intl = useIntl();

    const data = useMemo(() => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        const endDate = new Date(now);
        endDate.setDate(now.getDate() + 21);

        const dateMap: Record<string, number> = {};
        const currentDate = new Date(startDate);

        while (currentDate <= endDate) {
            const dateStr = currentDate.toISOString().split("T")[0];

            const overdueCount = mapPoints.filter((point) => {
                if (!point.dueDate) return false;

                const dueDate = new Date(point.dueDate);
                dueDate.setHours(0, 0, 0, 0);

                return dueDate <= currentDate;
            }).length;

            dateMap[dateStr] = overdueCount;
            currentDate.setDate(currentDate.getDate() + 1);
        }

        return (
            Object.entries(dateMap)
                // Warning: Sort by date ascending for precaution
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([date, count]) => ({
                    date: new Date(date).toLocaleDateString(intl.locale, {
                        day: "2-digit",
                        month: "2-digit",
                    }),
                    overdue: count,
                }))
        );
    }, [mapPoints]);

    return (
        <div className="c-timeline-chart">
            <h3>{fm("pointsByDueDate")}</h3>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip labelStyle={{ color: "#000000" }} />
                    <Legend />
                    <Line
                        type="monotone"
                        dataKey="overdue"
                        stroke="#ef4444"
                        strokeWidth={2}
                        name={intl.formatMessage({
                            id: "components.TimelineChart.overdue",
                        })}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};
