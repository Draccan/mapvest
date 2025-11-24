import { MapPin, AlertCircle } from "lucide-react";
import React, { useState, useEffect } from "react";

import type { CreateMapPointDto } from "../../../core/dtos/CreateMapPointDto";
import getFormattedMessageWithScope from "../../../utils/getFormattedMessageWithScope";
import { Button } from "../Button";
import "./style.css";

const fm = getFormattedMessageWithScope("components.MapPointForm");

const convertStandardDateToItDate = (yyyymmdd: string): string => {
    const match = yyyymmdd.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return "";
    const [, year, month, day] = match;
    return `${day}/${month}/${year}`;
};

const getTodayYyyymmdd = (): string => {
    return new Date().toISOString().split("T")[0];
};

const ErrorBoundary = ({ children }: any) => {
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        const handleError = (error: any) => {
            console.error("Error caught by boundary:", error);
            setHasError(true);
        };

        window.addEventListener("error", handleError);
        return () => window.removeEventListener("error", handleError);
    }, []);

    if (hasError) {
        return <div>Something went wrong. Check console for details.</div>;
    }

    return children;
};

interface MapPointFormProps {
    selectedCoordinates: { long: number; lat: number } | null;
    onSave: (data: CreateMapPointDto) => Promise<void>;
    loading: boolean;
}

export const MapPointForm: React.FC<MapPointFormProps> = ({
    selectedCoordinates,
    onSave,
    loading,
}) => {
    const [description, setDescription] = useState<string>("");
    const [dateValue, setDateValue] = useState(getTodayYyyymmdd());
    const [errors, setErrors] = useState<string[]>([]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const newErrors: string[] = [];

        if (!selectedCoordinates) {
            newErrors.push("Select a point on the map");
        }

        if (!dateValue) {
            newErrors.push("Date is required");
        }

        setErrors(newErrors);

        if (newErrors.length === 0 && selectedCoordinates) {
            try {
                // Convert date from YYYY-MM-DD to DD/MM/YYYY for the API
                const dateDdMmYyyy = convertStandardDateToItDate(dateValue);

                await onSave({
                    long: selectedCoordinates.long,
                    lat: selectedCoordinates.lat,
                    description:
                        description.trim() === "" ? undefined : description,
                    date: dateDdMmYyyy,
                });

                setDescription("");
                setDateValue(getTodayYyyymmdd());
            } catch (error) {
                setErrors(["Errore durante il salvataggio"]);
            }
        }
    };

    return (
        <ErrorBoundary>
            <div className="c-mapPoint-form">
                <h2>{fm("addMapPoint")}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="c-form-group">
                        <label htmlFor="Xcoordinate">
                            {fm("XCoordinateLabel")}
                        </label>
                        <input
                            type="text"
                            id="Xcoordinate"
                            value={selectedCoordinates?.long.toFixed(6) || ""}
                            disabled
                            className="c-coordinate-input"
                        />
                    </div>
                    <div className="c-form-group">
                        <label htmlFor="Ycoordinate">
                            {fm("YCoordinateLabel")}
                        </label>
                        <input
                            type="text"
                            id="Ycoordinate"
                            value={selectedCoordinates?.lat.toFixed(6) || ""}
                            disabled
                            className="c-coordinate-input"
                        />
                    </div>
                    <div className="c-form-group">
                        <label htmlFor="description">
                            {fm("description")}:
                        </label>
                        <input
                            type="text"
                            id="description"
                            value={description}
                            className="c-description-input"
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                    <div className="c-form-group">
                        <label htmlFor="date">{fm("date")}:</label>
                        <input
                            type="date"
                            id="date"
                            value={dateValue}
                            onChange={(e) => setDateValue(e.target.value)}
                            className="c-date-input"
                        />
                    </div>
                    {errors.length > 0 && (
                        <div className="c-errors">
                            {errors.map((error, index) => (
                                <div key={index} className="c-error">
                                    <AlertCircle size={16} />
                                    <span>{error}</span>
                                </div>
                            ))}
                        </div>
                    )}
                    <Button
                        type="submit"
                        kind="primary"
                        disabled={!selectedCoordinates}
                        loading={loading}
                    >
                        <span key="button-text">
                            {loading ? fm("saving") : fm("save")}
                        </span>
                    </Button>
                </form>
                <div className="c-instructions">
                    <MapPin size={18} />
                    <p>{fm("clickOnMapInstructions")}</p>
                </div>
            </div>
        </ErrorBoundary>
    );
};
