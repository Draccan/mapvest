import React, { useState, useEffect } from "react";

import { MapPointType } from "../../../core/commons/enums";
import type { CreateMapPointDto } from "../../../core/dtos/CreateMapPointDto";
import getFormattedMessageWithScope from "../../../utils/getFormattedMessageWithScope";
import { Button } from "../Button";
import "./style.css";

const fm = getFormattedMessageWithScope("components.MapPointForm");

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
    const [type, setType] = useState<MapPointType>(MapPointType.Theft);
    const [date, setDate] = useState(new Date().toLocaleDateString("it-IT"));
    const [errors, setErrors] = useState<string[]>([]);

    const validateDate = (dateString: string): boolean => {
        const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
        const match = dateString.match(regex);

        return !!match;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const newErrors: string[] = [];

        if (!selectedCoordinates) {
            newErrors.push("Select a point on the map");
        }

        if (!date.trim()) {
            newErrors.push("Enter a date");
        } else if (!validateDate(date)) {
            newErrors.push("Invalid date format. Use DD/MM/YYYY");
        }

        setErrors(newErrors);

        if (newErrors.length === 0 && selectedCoordinates) {
            try {
                await onSave({
                    long: selectedCoordinates.long,
                    lat: selectedCoordinates.lat,
                    type,
                    date,
                });

                setType(MapPointType.Theft);
                const formattedToday = new Date().toLocaleDateString("it-IT");
                setDate(formattedToday);
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
                        <label htmlFor="type">{fm("type")}:</label>
                        <select
                            id="type"
                            value={type}
                            onChange={(e) =>
                                setType(e.target.value as MapPointType)
                            }
                            className="c-type-select"
                        >
                            <option value={MapPointType.Theft}>
                                {fm("options.theft")}
                            </option>
                            <option value={MapPointType.Aggression}>
                                {fm("options.aggression")}
                            </option>
                            <option value={MapPointType.Robbery}>
                                {fm("options.robbery")}
                            </option>
                        </select>
                    </div>
                    <div className="c-form-group">
                        <label htmlFor="date">{fm("date")} (DD/MM/YYYY):</label>
                        <input
                            type="text"
                            id="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            placeholder="DD/MM/YYYY"
                            className="c-date-input"
                        />
                    </div>
                    {errors.length > 0 && (
                        <div className="c-errors">
                            {errors.map((error, index) => (
                                <div key={index} className="c-error">
                                    {error}
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
                    <p>📍 {fm("clickOnMapInstructions")}</p>
                </div>
            </div>
        </ErrorBoundary>
    );
};
