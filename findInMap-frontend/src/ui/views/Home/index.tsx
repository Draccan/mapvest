import { Copy, ScanSearch, X } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useIntl } from "react-intl";
import toast from "react-hot-toast";

import { UserGroupRole } from "../../../core/commons/enums";
import { useGroupsMaps } from "../../../core/contexts/GroupsMapsContext";
import type { CategoryDto } from "../../../core/dtos/CategoryDto";
import { type CreateMapPointDto } from "../../../core/dtos/CreateMapPointDto";
import { type MapPointDto } from "../../../core/dtos/MapPointDto";
import { type UpdateMapPointDto } from "../../../core/dtos/UpdateMapPointDto";
import { useCalculateOptimizedRoute } from "../../../core/usecases/useCalculateOptimizedRoute";
import { useCreateMapCategory } from "../../../core/usecases/useCreateMapCategory";
import { useCreateMapPoint } from "../../../core/usecases/useCreateMapPoint";
import { useDeleteMapCategory } from "../../../core/usecases/useDeleteMapCategory";
import { useDeleteMapPoints } from "../../../core/usecases/useDeleteMapPoints";
import { useGetMapCategories } from "../../../core/usecases/useGetMapCategories";
import { useGetMapPoints } from "../../../core/usecases/useGetMapPoints";
import { useUpdateMapPoint } from "../../../core/usecases/useUpdateMapPoint";
import getPointsInBounds from "../../../utils/getPointsInBounds";
import usePrevious from "../../commons/hooks/usePrevious";
import { AddressSearch } from "../../components/AddressSearch";
import { AreaAnalysis } from "../../components/AreaAnalysis";
import { Button } from "../../components/Button";
import { Header } from "../../components/Header";
import {
    DEFAULT_MAP_CLICK_ZOOM,
    MapContainer,
} from "../../components/MapContainer";
import { MapPointForm } from "../../components/MapPointForm";
import { RouteDetailsModal } from "../../components/RouteDetailsModal";
import { Skeleton } from "../../components/Skeleton";
import { ThemeToggle } from "../../components/ThemeToggle";
import { Toggle } from "../../components/Toggle";
import "./style.css";

export const Home: React.FC = () => {
    const intl = useIntl();
    const { selectedGroup, selectedMap, updateSelectedMap, updatingMap } =
        useGroupsMaps();
    const [selectedCoordinates, setSelectedCoordinates] = useState<{
        long: number;
        lat: number;
        zoom?: number;
    } | null>(null);
    const [deletingPointId, setDeletingPointId] = useState<string | null>(null);
    const [isAnalysisMode, setIsAnalysisMode] = useState(false);
    const [pointsInArea, setPointsInArea] = useState<MapPointDto[]>([]);
    const [startPoint, setStartPoint] = useState<MapPointDto | null>(null);
    const [endPoint, setEndPoint] = useState<MapPointDto | null>(null);
    const [pointToEdit, setPointToEdit] = useState<MapPointDto | null>(null);
    const [isRouteDetailsModalOpen, setIsRouteDetailsModalOpen] =
        useState(false);
    const [routePoints, setRoutePoints] = useState<MapPointDto[]>([]);

    const previousSelectedMapId = usePrevious(selectedMap?.id);

    const {
        data: mapPointsData,
        fetch: fetchMapPoints,
        loading: loadingPoints,
        error: mapPointsError,
        hasFetched,
        reset: resetMapPoints,
    } = useGetMapPoints();

    const {
        data: categoriesData,
        fetch: fetchCategories,
        loading: loadingCategories,
        hasFetched: hasFetchedCategories,
        reset: resetCategories,
    } = useGetMapCategories();

    const { createMapPoint, loading: creatingPoint } = useCreateMapPoint();
    const { updateMapPoint, loading: updatingPoint } = useUpdateMapPoint();
    const { createCategory, loading: creatingCategory } =
        useCreateMapCategory();
    const { deleteCategory, loading: deletingCategory } =
        useDeleteMapCategory();
    const previousCreatingCategory = usePrevious(creatingCategory);
    const { deleteMapPoints } = useDeleteMapPoints();
    const {
        calculateOptimizedRoute,
        reset: resetOptimizedRoute,
        loading: isOptimizingRoute,
        data: optimizedRoute,
    } = useCalculateOptimizedRoute();

    useEffect(() => {
        if (
            selectedGroup &&
            selectedMap &&
            !loadingCategories &&
            previousCreatingCategory &&
            !creatingCategory
        ) {
            fetchCategories(selectedGroup.id, selectedMap.id);
        }
    }, [
        selectedGroup,
        selectedMap,
        loadingCategories,
        categoriesData,
        creatingCategory,
        previousCreatingCategory,
        fetchCategories,
    ]);

    useEffect(() => {
        if (
            selectedGroup &&
            selectedMap &&
            previousSelectedMapId !== selectedMap.id &&
            !loadingPoints &&
            !mapPointsError
        ) {
            resetMapPoints();
            resetCategories();

            setSelectedCoordinates(null);
            setPointToEdit(null);
            setPointsInArea([]);
            setStartPoint(null);
            setEndPoint(null);
            setRoutePoints([]);
            resetOptimizedRoute();

            fetchCategories(selectedGroup.id, selectedMap.id);
            fetchMapPoints(selectedGroup.id, selectedMap.id);
        }
    }, [
        selectedGroup,
        selectedMap,
        previousSelectedMapId,
        fetchMapPoints,
        fetchCategories,
        resetOptimizedRoute,
    ]);

    const handleMapPointSelection = (lng: number, lat: number) => {
        setSelectedCoordinates({
            long: lng,
            lat: lat,
            zoom: DEFAULT_MAP_CLICK_ZOOM,
        });
        setPointToEdit(null);
    };

    const handleSavePoint = async (pointData: CreateMapPointDto) => {
        const result = await createMapPoint(
            selectedGroup!.id,
            selectedMap!.id,
            pointData,
        );
        if (result) {
            await fetchMapPoints(selectedGroup!.id, selectedMap!.id);
            setSelectedCoordinates(null);
        }
    };

    const handleEditPoint = (point: MapPointDto) => {
        setPointToEdit(point);
        setSelectedCoordinates({ long: point.long, lat: point.lat, zoom: 15 });
    };

    const handleUpdatePoint = async (pointData: UpdateMapPointDto) => {
        if (!pointToEdit) return;

        const result = await updateMapPoint(
            selectedGroup!.id,
            selectedMap!.id,
            pointToEdit.id,
            pointData,
        );
        if (result) {
            await fetchMapPoints(selectedGroup!.id, selectedMap!.id);
            setPointToEdit(null);
            setSelectedCoordinates(null);
        }
    };

    const handleDeletePoint = async (pointId: string) => {
        setDeletingPointId(pointId);
        try {
            await deleteMapPoints(selectedGroup!.id, selectedMap!.id, [
                pointId,
            ]);
            await fetchMapPoints(selectedGroup!.id, selectedMap!.id);
        } finally {
            setDeletingPointId(null);
        }
    };

    const toggleAnalysisMode = () => {
        setIsAnalysisMode(!isAnalysisMode);
        if (isAnalysisMode) {
            setPointsInArea([]);
            setSelectedCoordinates(null);
            setStartPoint(null);
            setEndPoint(null);
            setRoutePoints([]);
            resetOptimizedRoute();
        }
    };

    const canTogglePublic =
        selectedGroup?.role === UserGroupRole.Owner ||
        selectedGroup?.role === UserGroupRole.Admin;

    const handlePublicToggle = async (isPublic: boolean) => {
        updateSelectedMap({ isPublic });
    };

    const handleCopyPublicLink = () => {
        if (!selectedMap?.publicId) return;
        const publicLink = `${window.location.origin}/public/map/${selectedMap.publicId}`;
        navigator.clipboard.writeText(publicLink);
        toast.success(intl.formatMessage({ id: "views.Home.linkCopied" }));
    };

    const handleOptimizeRoute = () => {
        if (!startPoint || !endPoint || pointsInArea.length === 0) {
            return;
        }

        const destinations = pointsInArea.filter(
            (point) => point.id !== startPoint.id && point.id !== endPoint.id,
        );
        const mapPoints = [startPoint, ...destinations, endPoint];
        setRoutePoints(mapPoints);
        calculateOptimizedRoute(startPoint, destinations, endPoint);
    };

    const handleAreaDrawn = (bounds: L.LatLngBounds | null) => {
        const pointsInArea = bounds
            ? getPointsInBounds(mapPointsData || [], bounds)
            : [];
        setPointsInArea(pointsInArea);
    };

    const handleCreateCategory = (
        description: string,
        color: string,
    ): Promise<CategoryDto | null> => {
        return createCategory(selectedGroup!.id, selectedMap!.id, {
            description,
            color,
        });
    };

    const handleDeleteCategory = async (
        categoryId: string,
    ): Promise<boolean> => {
        const success = await deleteCategory(
            selectedGroup!.id,
            selectedMap!.id,
            categoryId,
        );
        if (success) {
            resetCategories();
            resetMapPoints();
            fetchCategories(selectedGroup!.id, selectedMap!.id);
            fetchMapPoints(selectedGroup!.id, selectedMap!.id);
        }
        return success;
    };

    const mapPoints = mapPointsData || [];
    const categories = categoriesData || [];

    return (
        <div className="v-home">
            <ThemeToggle className="v-home-ThemeToggle" />
            <div className="v-home-container">
                <Header />
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
                            {canTogglePublic && (
                                <div className="v-home-public-toggle-wrapper">
                                    <span className="v-home-public-toggle-label">
                                        {intl.formatMessage({
                                            id: "views.Home.publicMapToggle",
                                        })}
                                    </span>
                                    <Toggle
                                        checked={selectedMap?.isPublic ?? false}
                                        onChange={handlePublicToggle}
                                        disabled={updatingMap}
                                        ariaLabel={intl.formatMessage({
                                            id: "views.Home.publicMapToggle",
                                        })}
                                    />
                                </div>
                            )}
                            {selectedMap?.isPublic && (
                                <Button
                                    kind="secondary"
                                    size="icon"
                                    onClick={handleCopyPublicLink}
                                    title={intl.formatMessage({
                                        id: "views.Home.copyPublicLink",
                                    })}
                                    aria-label={intl.formatMessage({
                                        id: "views.Home.copyPublicLink",
                                    })}
                                    className="v-home-copy-link"
                                >
                                    <Copy size={20} />
                                </Button>
                            )}
                        </div>
                        <div className="v-home-map">
                            {!hasFetched || !hasFetchedCategories ? (
                                <Skeleton />
                            ) : (
                                <MapContainer
                                    mapPoints={mapPoints}
                                    categories={categories}
                                    onMapClick={handleMapPointSelection}
                                    selectedCoordinates={selectedCoordinates}
                                    onDeletePoint={handleDeletePoint}
                                    onEditPoint={handleEditPoint}
                                    deletingPointId={deletingPointId}
                                    drawingEnabled={isAnalysisMode}
                                    onAreaDrawn={handleAreaDrawn}
                                    optimizedRoute={optimizedRoute}
                                    startPoint={startPoint}
                                    endPoint={endPoint}
                                    mapId={selectedMap?.id}
                                />
                            )}
                        </div>
                    </div>
                    <div className="v-home-form-section">
                        {isAnalysisMode ? (
                            <AreaAnalysis
                                pointsInArea={pointsInArea}
                                startPoint={startPoint}
                                endPoint={endPoint}
                                onStartPointSelect={setStartPoint}
                                onEndPointSelect={setEndPoint}
                                onOptimizeRoute={handleOptimizeRoute}
                                isOptimizingRoute={isOptimizingRoute}
                                optimizedRoute={optimizedRoute}
                                onShowRouteDetails={() =>
                                    setIsRouteDetailsModalOpen(true)
                                }
                            />
                        ) : (
                            <MapPointForm
                                selectedCoordinates={selectedCoordinates}
                                onSave={handleSavePoint}
                                onUpdate={handleUpdatePoint}
                                loading={creatingPoint || updatingPoint}
                                categories={categories}
                                onCreateCategory={handleCreateCategory}
                                onDeleteCategory={handleDeleteCategory}
                                loadingCategory={creatingCategory}
                                loadingDeleteCategory={deletingCategory}
                                pointToEdit={pointToEdit}
                                mapId={selectedMap?.id}
                            />
                        )}
                    </div>
                </div>
            </div>
            {optimizedRoute && (
                <RouteDetailsModal
                    isOpen={isRouteDetailsModalOpen}
                    onClose={() => setIsRouteDetailsModalOpen(false)}
                    route={optimizedRoute}
                    points={routePoints}
                    categories={categoriesData || []}
                />
            )}
        </div>
    );
};
