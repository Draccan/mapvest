import React, { useMemo } from "react";
import { useIntl } from "react-intl";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

import type { MapPointDto } from "../../../core/dtos/MapPointDto";
import type { CategoryDto } from "../../../core/dtos/CategoryDto";
import getFormattedMessageWithScope from "../../../utils/getFormattedMessageWithScope";
import "./style.css";

const fm = getFormattedMessageWithScope("components.CategoryChart");

interface CategoryChartProps {
    mapPoints: MapPointDto[];
    categories: CategoryDto[];
}

export const CategoryChart: React.FC<CategoryChartProps> = ({
    mapPoints,
    categories,
}) => {
    const intl = useIntl();

    const countKey = intl.formatMessage({
        id: "components.CategoryChart.count",
    });

    const data = useMemo(() => {
        const pointsByCategory = mapPoints.reduce(
            (categoryRecord, point) => {
                const categoryId = point.categoryId || "none";
                categoryRecord[categoryId] =
                    (categoryRecord[categoryId] || 0) + 1;
                return categoryRecord;
            },
            {} as Record<string, number>,
        );

        return Object.entries(pointsByCategory).map(([categoryId, count]) => {
            const category = categories.find(
                (category) => category.id === categoryId,
            );
            return {
                category:
                    category?.description ||
                    intl.formatMessage({
                        id: "components.CategoryChart.noCategory",
                    }),
                [countKey]: count,
                fill: category?.color || "#94a3b8",
            };
        });
    }, [mapPoints, categories, intl]);

    return (
        <div className="c-category-chart">
            <h3>{fm("pointsByCategory")}</h3>
            {data.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="category" />
                        <YAxis />
                        <Tooltip labelStyle={{ color: "#000000" }} />
                        <Legend />
                        <Bar dataKey={countKey} fill="#8884d8" />
                    </BarChart>
                </ResponsiveContainer>
            ) : (
                <p className="c-category-chart-no-data">{fm("noData")}</p>
            )}
        </div>
    );
};
