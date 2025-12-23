import React, { useEffect } from "react";

import { useGroupsMaps } from "../../../core/contexts/GroupsMapsContext";
import { useGetMapPoints } from "../../../core/usecases/useGetMapPoints";
import { useGetMapCategories } from "../../../core/usecases/useGetMapCategories";
import usePrevious from "../../commons/hooks/usePrevious";
import { Header } from "../../components/Header";
import { Skeleton } from "../../components/Skeleton";
import { ThemeToggle } from "../../components/ThemeToggle";
import { KpiCards } from "../../components/KpiCards";
import { CategoryChart } from "../../components/CategoryChart";
import { TimelineChart } from "../../components/TimelineChart";
import { DashboardHeatmap } from "../../components/DashboardHeatmap";
import "./style.css";

export const Dashboard: React.FC = () => {
    const { selectedGroup, selectedMap } = useGroupsMaps();
    const previousSelectedMapId = usePrevious(selectedMap?.id);

    const {
        data: mapPointsData,
        fetch: fetchMapPoints,
        loading: loadingPoints,
        error: mapPointsError,
    } = useGetMapPoints();

    const {
        data: categoriesData,
        fetch: fetchCategories,
        loading: loadingCategories,
    } = useGetMapCategories();

    useEffect(() => {
        if (
            selectedGroup &&
            selectedMap &&
            !loadingPoints &&
            !mapPointsData &&
            !mapPointsError
        ) {
            fetchMapPoints(selectedGroup.id, selectedMap.id);
        }
    }, [
        selectedGroup,
        selectedMap,
        loadingPoints,
        mapPointsData,
        mapPointsError,
        fetchMapPoints,
    ]);

    useEffect(() => {
        if (
            selectedGroup &&
            selectedMap &&
            !loadingCategories &&
            !categoriesData
        ) {
            fetchCategories(selectedGroup.id, selectedMap.id);
        }
    }, [
        selectedGroup,
        selectedMap,
        loadingCategories,
        categoriesData,
        fetchCategories,
    ]);

    useEffect(() => {
        if (
            selectedGroup &&
            selectedMap &&
            previousSelectedMapId &&
            previousSelectedMapId !== selectedMap.id
        ) {
            fetchMapPoints(selectedGroup.id, selectedMap.id);
            fetchCategories(selectedGroup.id, selectedMap.id);
        }
    }, [
        selectedGroup,
        selectedMap,
        previousSelectedMapId,
        fetchMapPoints,
        fetchCategories,
    ]);

    const isLoading = loadingPoints || loadingCategories;

    return (
        <div className="v-dashboard">
            <ThemeToggle className="v-dashboard-theme-toggle" />
            <div className="v-dashboard-container">
                <Header />

                <div className="v-dashboard-main">
                    {isLoading ? (
                        <>
                            <div className="v-dashboard-kpis-skeleton">
                                <Skeleton height="120px" />
                                <Skeleton height="120px" />
                                <Skeleton height="120px" />
                                <Skeleton height="120px" />
                            </div>
                            <div className="v-dashboard-charts">
                                <Skeleton height="350px" />
                                <Skeleton height="350px" />
                            </div>
                            <Skeleton height="500px" />
                        </>
                    ) : (
                        <>
                            <KpiCards mapPoints={mapPointsData || []} />

                            <div className="v-dashboard-charts">
                                <CategoryChart
                                    mapPoints={mapPointsData || []}
                                    categories={categoriesData || []}
                                />
                                <TimelineChart
                                    mapPoints={mapPointsData || []}
                                />
                            </div>

                            <DashboardHeatmap mapPoints={mapPointsData || []} />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
