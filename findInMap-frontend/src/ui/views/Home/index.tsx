import React, { useState, useEffect } from "react";

import { type CreateMapPointDto } from "../../../core/dtos/CreateMapPointDto";
import { useCreateMapPoint } from "../../../core/usecases/useCreateMapPoint";
import { useGetMapPoints } from "../../../core/usecases/useGetMapPoints";
import getFormattedMessageWithScope from "../../../utils/getFormattedMessageWithScope";
import LogoSvg from "../../assets/logo.svg";
import routes from "../../commons/routes";
import { AddressSearch } from "../../components/AddressSearch";
import { Link } from "../../components/Link";
import { MapContainer } from "../../components/MapContainer";
import { MapPointForm } from "../../components/MapPointForm";
import initializeGoogleMaps from "../../utils/initializeGoogleMaps";
import "./style.css";

const fm = getFormattedMessageWithScope("views.Home");

initializeGoogleMaps();

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
    } = useGetMapPoints();
    const { createMapPoint, loading: creatingPoint } = useCreateMapPoint();

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
            <div className="v-home-container">
                <header className="v-home-header">
                    <div className="v-home-logo">
                        <img src={LogoSvg} alt="MapVest" />
                    </div>
                    <nav className="v-home-navigation">
                        <Link to={routes.about()} kind="nav">
                            {fm("about")}
                        </Link>
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
                {loadingPoints && (
                    <div className="v-home-loading">
                        {fm("loadingMapPoints")}
                    </div>
                )}
            </div>
        </div>
    );
};
