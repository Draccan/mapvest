import React, { useState, useEffect } from "react";

import { type CreateMapPointDto } from "../../../core/dtos/CreateMapPointDto";
import { useCreateMapPoint } from "../../../core/usecases/useCreateMapPoint";
import { useGetMapPoints } from "../../../core/usecases/useGetMapPoints";
import getFormattedMessageWithScope from "../../../utils/getFormattedMessageWithScope";
import routes from "../../commons/routes";
import { Link } from "../../components/Link";
import { MapContainer } from "../../components/MapContainer";
import { MapPointForm } from "../../components/MapPointForm";
import "./style.css";

const fm = getFormattedMessageWithScope("views.Home");

export const Home: React.FC = () => {
    const [selectedCoordinates, setSelectedCoordinates] = useState<{
        x: number;
        y: number;
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

    const handleMapClick = (lng: number, lat: number) => {
        setSelectedCoordinates({ x: lng, y: lat });
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
                <header className="v-header">
                    <h1>MapVest</h1>
                    <nav className="v-navigation">
                        <Link to={routes.about()} kind="nav">
                            {fm("about")}
                        </Link>
                    </nav>
                </header>
                <div className="v-main-content">
                    <div className="v-map-section">
                        <MapContainer
                            mapPoints={mapPoints}
                            onMapClick={handleMapClick}
                            selectedCoordinates={selectedCoordinates}
                        />
                    </div>
                    <div className="v-form-section">
                        <MapPointForm
                            selectedCoordinates={selectedCoordinates}
                            onSave={handleSavePoint}
                            loading={creatingPoint}
                        />
                    </div>
                </div>
                {loadingPoints && (
                    <div className="v-loading">{fm("loadingMapPoints")}</div>
                )}
            </div>
        </div>
    );
};
