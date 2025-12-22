import React, { useEffect } from "react";

import { useGetGroupMaps } from "../../../core/usecases/useGetGroupMaps";
import { useGetMapPoints } from "../../../core/usecases/useGetMapPoints";
import { useGetMapCategories } from "../../../core/usecases/useGetMapCategories";
import { useGetUserGroups } from "../../../core/usecases/useGetUserGroups";
import { Header } from "../../components/Header";
import { Skeleton } from "../../components/Skeleton";
import { ThemeToggle } from "../../components/ThemeToggle";
import { KpiCards } from "../../components/KpiCards";
import { CategoryChart } from "../../components/CategoryChart";
import { TimelineChart } from "../../components/TimelineChart";
import { DashboardHeatmap } from "../../components/DashboardHeatmap";
import "./style.css";

export const Dashboard: React.FC = () => {
    const {
        data: groupsData,
        fetch: fetchGroups,
        loading: loadingGroups,
        error: groupsError,
    } = useGetUserGroups();

    const {
        data: mapsData,
        fetch: fetchMaps,
        loading: loadingMaps,
        error: mapsError,
    } = useGetGroupMaps();

    const {
        data: mapPointsData,
        fetch: fetchMapPoints,
        loading: loadingPoints,
    } = useGetMapPoints();

    const {
        data: categoriesData,
        fetch: fetchCategories,
        loading: loadingCategories,
    } = useGetMapCategories();

    useEffect(() => {
        if (!groupsData && !loadingGroups && !groupsError) {
            fetchGroups();
        }
    }, [fetchGroups, loadingGroups, groupsData, groupsError]);

    useEffect(() => {
        if (
            groupsData &&
            groupsData.length > 0 &&
            !mapsData &&
            !loadingMaps &&
            !mapsError
        ) {
            fetchMaps(groupsData[0].id);
        }
    }, [groupsData, mapsData, loadingMaps, fetchMaps, mapsError]);

    useEffect(() => {
        if (
            mapsData &&
            mapsData.length > 0 &&
            groupsData &&
            groupsData.length > 0 &&
            !loadingPoints &&
            !mapPointsData
        ) {
            const firstMap = mapsData[0];
            fetchMapPoints(groupsData[0].id, firstMap.id);
        }
    }, [mapsData, groupsData, loadingPoints, mapPointsData, fetchMapPoints]);

    useEffect(() => {
        if (
            mapsData &&
            mapsData.length > 0 &&
            groupsData &&
            groupsData.length > 0 &&
            !loadingCategories &&
            !categoriesData
        ) {
            const firstMap = mapsData[0];
            fetchCategories(groupsData[0].id, firstMap.id);
        }
    }, [
        mapsData,
        groupsData,
        loadingCategories,
        categoriesData,
        fetchCategories,
    ]);

    const isLoading =
        loadingGroups || loadingMaps || loadingPoints || loadingCategories;

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
