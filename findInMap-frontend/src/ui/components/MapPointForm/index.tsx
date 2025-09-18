import React, { useState, useEffect } from "react";

import { MapPointType } from "../../../core/commons/enums";
import type { CreateMapPointDto } from "../../../core/dtos/CreateMapPointDto";
import "./style.css";

interface MapPointFormProps {
    selectedCoordinates: { x: number; y: number } | null;
    onSave: (data: CreateMapPointDto) => Promise<void>;
    loading: boolean;
}

export const MapPointForm: React.FC<MapPointFormProps> = ({
    selectedCoordinates,
    onSave,
    loading,
}) => {
    const [type, setType] = useState<MapPointType>(MapPointType.Theft);
    const [date, setDate] = useState("");
    const [errors, setErrors] = useState<string[]>([]);

    useEffect(() => {
        const formattedToday = new Date().toLocaleDateString("it-IT");
        setDate(formattedToday);
    }, []);

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
                    x: selectedCoordinates.x,
                    y: selectedCoordinates.y,
                    type,
                    date,
                });

                // Reset form after successful save
                setType(MapPointType.Theft);
                const formattedToday = new Date().toLocaleDateString("it-IT");
                setDate(formattedToday);
            } catch (error) {
                setErrors(["Errore durante il salvataggio"]);
            }
        }
    };

    return (
        <div className="c-mapPoint-form">
            <h2>Add Map Point</h2>
            <form onSubmit={handleSubmit}>
                <div className="c-form-group">
                    <label htmlFor="Xcoordinate">X Coordinate:</label>
                    <input
                        type="text"
                        id="Xcoordinate"
                        value={selectedCoordinates?.x.toFixed(6) || ""}
                        disabled
                        className="c-coordinate-input"
                    />
                </div>

                <div className="c-form-group">
                    <label htmlFor="Ycoordinate">Y Coordinate:</label>
                    <input
                        type="text"
                        id="Ycoordinate"
                        value={selectedCoordinates?.y.toFixed(6) || ""}
                        disabled
                        className="c-coordinate-input"
                    />
                </div>

                <div className="c-form-group">
                    <label htmlFor="type">Type:</label>
                    <select
                        id="type"
                        value={type}
                        onChange={(e) =>
                            setType(e.target.value as MapPointType)
                        }
                        className="c-type-select"
                    >
                        <option value={MapPointType.Theft}>Theft</option>
                        <option value={MapPointType.Aggression}>
                            Aggression
                        </option>
                        <option value={MapPointType.Robbery}>Robbery</option>
                    </select>
                </div>

                <div className="c-form-group">
                    <label htmlFor="date">Date (DD/MM/YYYY):</label>
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

                <button
                    type="submit"
                    disabled={loading || !selectedCoordinates}
                    className="c-save-button"
                >
                    {loading ? "Saving..." : "Save"}
                </button>
            </form>

            <div className="c-instructions">
                <p>📍 Click on the map to select a point</p>
            </div>
        </div>
    );
};
