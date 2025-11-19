import { ScanSearch, X } from "lucide-react";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useIntl } from "react-intl";

import { type CreateMapPointDto } from "../../../core/dtos/CreateMapPointDto";
import { type MapPointDto } from "../../../core/dtos/MapPointDto";
import { useCreateMapPoint } from "../../../core/usecases/useCreateMapPoint";
import { useDeleteMapPoints } from "../../../core/usecases/useDeleteMapPoints";
import { useGetGroupMaps } from "../../../core/usecases/useGetGroupMaps";
import { useGetMapPoints } from "../../../core/usecases/useGetMapPoints";
import { useGetUserGroups } from "../../../core/usecases/useGetUserGroups";
import { useLogoutUser } from "../../../core/usecases/useLogoutUser";
import getFormattedMessageWithScope from "../../../utils/getFormattedMessageWithScope";
import getPointsInBounds from "../../../utils/getPointsInBounds";
import LogoSvg from "../../assets/logo.svg";
import routes from "../../commons/routes";
import { AddressSearch } from "../../components/AddressSearch";
import { AreaAnalysis } from "../../components/AreaAnalysis";
import { Button } from "../../components/Button";
import { Link } from "../../components/Link";
import { MapContainer } from "../../components/MapContainer";
import { MapPointForm } from "../../components/MapPointForm";
import { Skeleton } from "../../components/Skeleton";
import { ThemeToggle } from "../../components/ThemeToggle";
import "./style.css";

const fm = getFormattedMessageWithScope("views.Home");

export const Home: React.FC = () => {
    const intl = useIntl();
    const [selectedCoordinates, setSelectedCoordinates] = useState<{
        long: number;
        lat: number;
        zoom?: number;
    } | null>(null);
    const [deletingPointId, setDeletingPointId] = useState<string | null>(null);
    const [isAnalysisMode, setIsAnalysisMode] = useState(false);
    const [pointsInArea, setPointsInArea] = useState<MapPointDto[]>([]);

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
        error: mapPointsError,
        hasFetched,
    } = useGetMapPoints();

    const { createMapPoint, loading: creatingPoint } = useCreateMapPoint();
    const { deleteMapPoints } = useDeleteMapPoints();
    const { loading: loadingLogout, logout } = useLogoutUser();

    useEffect(() => {
        if (!loadingGroups && !groupsData && !groupsError) {
            fetchGroups();
        }
    }, [fetchGroups, loadingGroups, groupsData, groupsError]);

    useEffect(() => {
        if (
            groupsData &&
            groupsData.length > 0 &&
            !mapsData &&
            !mapsError &&
            !loadingMaps
        ) {
            const firstGroup = groupsData[0];
            fetchMaps(firstGroup.id);
        }
    }, [groupsData, mapsData, mapsError, loadingMaps, fetchMaps]);

    useEffect(() => {
        if (
            mapsData &&
            mapsData.length > 0 &&
            groupsData &&
            groupsData.length > 0 &&
            !loadingPoints &&
            !mapPointsData &&
            !mapPointsError
        ) {
            const firstMap = mapsData[0];
            fetchMapPoints(groupsData[0]!.id, firstMap.id);
        }
    }, [
        mapsData,
        groupsData,
        loadingPoints,
        mapPointsData,
        mapPointsError,
        fetchMapPoints,
    ]);

    const handleMapPointSelection = (lng: number, lat: number) => {
        setSelectedCoordinates({ long: lng, lat: lat, zoom: 15 });
    };

    const handleSavePoint = async (pointData: CreateMapPointDto) => {
        const firstGroup = groupsData![0]!;
        const firstMap = mapsData![0]!;
        const result = await createMapPoint(
            firstGroup.id,
            firstMap.id,
            pointData,
        );
        if (result) {
            await fetchMapPoints(firstGroup.id, firstMap.id);
            setSelectedCoordinates(null);
        }
    };

    const handleDeletePoint = async (pointId: string) => {
        const firstGroup = groupsData![0]!;
        const firstMap = mapsData![0]!;
        setDeletingPointId(pointId);
        try {
            await deleteMapPoints(firstGroup.id, firstMap.id, [pointId]);
            await fetchMapPoints(firstGroup.id, firstMap.id);
        } finally {
            setDeletingPointId(null);
        }
    };

    const toggleAnalysisMode = () => {
        setIsAnalysisMode(!isAnalysisMode);
        if (isAnalysisMode) {
            setPointsInArea([]);
            setSelectedCoordinates(null);
        }
    };

    // Warning: to avoid problems with the GeomanControl we need to avoid that
    // the handleAreaDrawn function changes on every render, but it needs always
    // the latest mapPointsData value.
    // TODO: think about using a useAreaDrawn hook to encapsulate this logic
    const mapPointsDataRef = useRef<MapPointDto[]>([]);

    useEffect(() => {
        mapPointsDataRef.current = mapPointsData || [];
    }, [mapPointsData]);

    const handleAreaDrawn = useCallback((bounds: L.LatLngBounds | null) => {
        const pointsInArea = bounds
            ? getPointsInBounds(mapPointsDataRef.current || [], bounds)
            : [];
        setPointsInArea(pointsInArea);
    }, []);

    const mapPoints = mapPointsData || [];
    const isLoading = loadingGroups || loadingMaps || loadingPoints;

    return (
        <div className="v-home">
            <ThemeToggle className="v-home-ThemeToggle" />
            <div className="v-home-container">
                <header className="v-home-header">
                    <div className="v-home-logo">
                        <img src={LogoSvg} alt="MapVest" />
                    </div>
                    <nav className="v-home-navigation">
                        <Link
                            to={routes.about()}
                            kind="nav"
                            className="v-home-about-nav-link"
                        >
                            {fm("about")}
                        </Link>
                        <Button
                            onClick={logout}
                            type="button"
                            kind="danger"
                            size="small"
                            loading={loadingLogout}
                        >
                            {fm("logout")}
                        </Button>
                    </nav>
                </header>
                <div className="v-home-content">
                    <div className="v-home-map-section">
                        <div className="v-home-search-wrapper">
                            {!isAnalysisMode && (
                                <AddressSearch
                                    onAddressSelect={handleMapPointSelection}
                                    className="v-home-address-search"
                                />
                            )}
                            <Button
                                kind={isAnalysisMode ? "danger" : "primary"}
                                size="icon"
                                onClick={toggleAnalysisMode}
                                title={intl.formatMessage({
                                    id: isAnalysisMode
                                        ? "views.Home.exitAnalysisMode"
                                        : "views.Home.enterAnalysisMode",
                                })}
                                aria-label={intl.formatMessage({
                                    id: isAnalysisMode
                                        ? "views.Home.exitAnalysisMode"
                                        : "views.Home.enterAnalysisMode",
                                })}
                                className="v-home-analysis-toggle"
                            >
                                {isAnalysisMode ? (
                                    <X size={20} />
                                ) : (
                                    <ScanSearch size={20} />
                                )}
                            </Button>
                        </div>
                        <div className="v-home-map">
                            {isLoading && !hasFetched && <Skeleton />}
                            <MapContainer
                                mapPoints={mapPoints}
                                onMapClick={handleMapPointSelection}
                                selectedCoordinates={selectedCoordinates}
                                onDeletePoint={handleDeletePoint}
                                deletingPointId={deletingPointId}
                                drawingEnabled={isAnalysisMode}
                                onAreaDrawn={handleAreaDrawn}
                            />
                        </div>
                    </div>
                    <div className="v-home-form-section">
                        {isAnalysisMode ? (
                            <AreaAnalysis pointsInArea={pointsInArea} />
                        ) : (
                            <MapPointForm
                                selectedCoordinates={selectedCoordinates}
                                onSave={handleSavePoint}
                                loading={creatingPoint}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
