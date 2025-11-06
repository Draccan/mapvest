import React, { useState, useEffect } from "react";

import { type CreateMapPointDto } from "../../../core/dtos/CreateMapPointDto";
import { useCreateMapPoint } from "../../../core/usecases/useCreateMapPoint";
import { useDeleteMapPoint } from "../../../core/usecases/useDeleteMapPoint";
import { useGetGroupMaps } from "../../../core/usecases/useGetGroupMaps";
import { useGetMapPoints } from "../../../core/usecases/useGetMapPoints";
import { useGetUserGroups } from "../../../core/usecases/useGetUserGroups";
import { useLogoutUser } from "../../../core/usecases/useLogoutUser";
import getFormattedMessageWithScope from "../../../utils/getFormattedMessageWithScope";
import LogoSvg from "../../assets/logo.svg";
import routes from "../../commons/routes";
import { AddressSearch } from "../../components/AddressSearch";
import { Button } from "../../components/Button";
import { Link } from "../../components/Link";
import { MapContainer } from "../../components/MapContainer";
import { MapPointForm } from "../../components/MapPointForm";
import { Skeleton } from "../../components/Skeleton";
import { ThemeToggle } from "../../components/ThemeToggle";
import "./style.css";

const fm = getFormattedMessageWithScope("views.Home");

export const Home: React.FC = () => {
    const [selectedCoordinates, setSelectedCoordinates] = useState<{
        long: number;
        lat: number;
        zoom?: number;
    } | null>(null);
    const [deletingPointId, setDeletingPointId] = useState<string | null>(null);

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
    const { deleteMapPoint } = useDeleteMapPoint();
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
        await deleteMapPoint(firstGroup.id, firstMap.id, [pointId]);
        await fetchMapPoints(firstGroup.id, firstMap.id);
        setDeletingPointId(null);
    };

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
                            <AddressSearch
                                onAddressSelect={handleMapPointSelection}
                                className="v-home-address-search"
                            />
                        </div>
                        <div className="v-home-map">
                            {isLoading && !hasFetched && <Skeleton />}
                            <MapContainer
                                mapPoints={mapPoints}
                                onMapClick={handleMapPointSelection}
                                selectedCoordinates={selectedCoordinates}
                                onDeletePoint={handleDeletePoint}
                                deletingPointId={deletingPointId}
                            />
                        </div>
                    </div>
                    <div className="v-home-form-section">
                        <MapPointForm
                            selectedCoordinates={selectedCoordinates}
                            onSave={handleSavePoint}
                            loading={creatingPoint}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
