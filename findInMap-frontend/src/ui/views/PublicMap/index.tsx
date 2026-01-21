import React, { useEffect } from "react";
import { useIntl } from "react-intl";
import { useParams } from "react-router-dom";

import { useGetPublicMap } from "../../../core/usecases/useGetPublicMap";
import { useGetPublicMapCategories } from "../../../core/usecases/useGetPublicMapCategories";
import { useGetPublicMapPoints } from "../../../core/usecases/useGetPublicMapPoints";
import LogoSvg from "../../assets/logo.svg";
import { MapContainer } from "../../components/MapContainer";
import { Skeleton } from "../../components/Skeleton";
import { ThemeToggle } from "../../components/ThemeToggle";
import "./style.css";

export const PublicMap: React.FC = () => {
    const intl = useIntl();
    const { mapId } = useParams<{ mapId: string }>();

    const {
        data: publicMapData,
        fetch: fetchPublicMap,
        loading: loadingPublicMap,
        error: publicMapError,
        hasFetched: hasFetchedPublicMap,
    } = useGetPublicMap();

    const {
        data: mapPointsData,
        fetch: fetchMapPoints,
        loading: loadingPoints,
        hasFetched: hasFetchedPoints,
        error: mapPointsError,
    } = useGetPublicMapPoints();

    const {
        data: categoriesData,
        fetch: fetchCategories,
        loading: loadingCategories,
        hasFetched: hasFetchedCategories,
        error: categoriesError,
    } = useGetPublicMapCategories();

    useEffect(() => {
        if (
            mapId &&
            !hasFetchedPublicMap &&
            !loadingPublicMap &&
            !publicMapError
        ) {
            fetchPublicMap(mapId);
        }
    }, [
        mapId,
        hasFetchedPublicMap,
        loadingPublicMap,
        fetchPublicMap,
        publicMapError,
    ]);

    useEffect(() => {
        if (mapId && hasFetchedPublicMap && !publicMapError) {
            if (!hasFetchedPoints && !loadingPoints && !mapPointsError) {
                fetchMapPoints(mapId);
            }
            if (
                !hasFetchedCategories &&
                !loadingCategories &&
                !categoriesError
            ) {
                fetchCategories(mapId);
            }
        }
    }, [
        mapId,
        hasFetchedPublicMap,
        publicMapError,
        hasFetchedPoints,
        loadingPoints,
        fetchMapPoints,
        hasFetchedCategories,
        loadingCategories,
        fetchCategories,
        categoriesError,
        mapPointsError,
    ]);

    const isLoading = loadingPublicMap || loadingPoints || loadingCategories;
    const hasError = publicMapError || categoriesError || mapPointsError;
    const isReady =
        hasFetchedPublicMap &&
        hasFetchedPoints &&
        hasFetchedCategories &&
        !hasError;

    return (
        <div className="v-public-map">
            <div className="v-public-map-container">
                <header className="v-public-map-header">
                    <div className="v-public-map-logo">
                        <img src={LogoSvg} alt="MapVest" />
                    </div>
                    {isReady && publicMapData && (
                        <h1 className="v-public-map-title">
                            {publicMapData.name}
                        </h1>
                    )}
                </header>
                <main className="v-public-map-content">
                    <div className="v-public-map-map-section">
                        {isLoading && !isReady && (
                            <div className="v-public-map-skeleton-container">
                                <Skeleton height="100%" width="100%" />
                            </div>
                        )}
                        {hasError && (
                            <div className="v-public-map-error">
                                {intl.formatMessage({
                                    id: "views.PublicMap.mapNotFound",
                                })}
                            </div>
                        )}
                        {isReady && (
                            <div className="v-public-map-map">
                                <MapContainer
                                    mapPoints={mapPointsData || []}
                                    categories={categoriesData || []}
                                />
                            </div>
                        )}
                    </div>
                </main>
                <ThemeToggle className="v-public-map-theme-toggle" />
            </div>
        </div>
    );
};
