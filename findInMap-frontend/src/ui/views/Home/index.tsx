import React, { useState, useEffect } from "react";

import { type CreateMapPointDto } from "../../../core/dtos/CreateMapPointDto";
import { useCreateMapPoint } from "../../../core/usecases/useCreateMapPoint";
import { useGetMapPoints } from "../../../core/usecases/useGetMapPoints";
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
    const {
        data: mapPointsData,
        fetch: fetchMapPoints,
        loading: loadingPoints,
        error,
        hasFetched,
    } = useGetMapPoints();
    const { createMapPoint, loading: creatingPoint } = useCreateMapPoint();
    const { loading: loadingLogout, logout } = useLogoutUser();

    useEffect(() => {
        if (!loadingPoints && !mapPointsData && !error) fetchMapPoints();
    }, [fetchMapPoints]);

    const handleMapPointSelection = (lng: number, lat: number) => {
        setSelectedCoordinates({ long: lng, lat: lat, zoom: 15 });
    };

    const handleSavePoint = async (pointData: CreateMapPointDto) => {
        const result = await createMapPoint(pointData);
        if (result) {
            await fetchMapPoints();
            setSelectedCoordinates(null);
        }
    };

    const mapPoints = mapPointsData || [];

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
                            {loadingPoints && !hasFetched && <Skeleton />}
                            <MapContainer
                                mapPoints={mapPoints}
                                onMapClick={handleMapPointSelection}
                                selectedCoordinates={selectedCoordinates}
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
