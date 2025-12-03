import { MapPin, AlertCircle, Plus } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useIntl } from "react-intl";

import type { CategoryDto } from "../../../core/dtos/CategoryDto";
import type { CreateMapPointDto } from "../../../core/dtos/CreateMapPointDto";
import type { MapPointDto } from "../../../core/dtos/MapPointDto";
import type { UpdateMapPointDto } from "../../../core/dtos/UpdateMapPointDto";
import getFormattedMessageWithScope from "../../../utils/getFormattedMessageWithScope";
import { Button } from "../Button";
import { CategoryModal } from "../CategoryModal";
import { Select } from "../Select";
import "./style.css";

const fm = getFormattedMessageWithScope("components.MapPointForm");

const getTodayYyyymmdd = (): string => {
    return new Date().toISOString().split("T")[0];
};

interface MapPointFormProps {
    selectedCoordinates: { long: number; lat: number } | null;
    onSave: (data: CreateMapPointDto) => Promise<void>;
    onUpdate?: (data: UpdateMapPointDto) => Promise<void>;
    loading: boolean;
    categories: CategoryDto[];
    onCreateCategory: (
        description: string,
        color: string,
    ) => Promise<CategoryDto | null>;
    loadingCategory: boolean;
    pointToEdit?: MapPointDto | null;
}

export const MapPointForm: React.FC<MapPointFormProps> = ({
    selectedCoordinates,
    onSave,
    onUpdate,
    loading,
    categories,
    onCreateCategory,
    loadingCategory,
    pointToEdit,
}) => {
    const intl = useIntl();
    const [description, setDescription] = useState<string>("");
    const [dateValue, setDateValue] = useState(getTodayYyyymmdd());
    const [categoryId, setCategoryId] = useState<string>("");
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);

    useEffect(() => {
        if (pointToEdit) {
            setDescription(pointToEdit.description || "");
            setDateValue(pointToEdit.date);
            setCategoryId(pointToEdit.categoryId || "");
        } else {
            setDescription("");
            setDateValue(getTodayYyyymmdd());
            setCategoryId("");
        }
    }, [pointToEdit]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const newErrors: string[] = [];

        if (!pointToEdit && !selectedCoordinates) {
            newErrors.push("Select a point on the map");
        }

        if (!dateValue) {
            newErrors.push("Date is required");
        }

        setErrors(newErrors);

        if (newErrors.length === 0) {
            try {
                if (pointToEdit && onUpdate) {
                    await onUpdate({
                        description:
                            description.trim() === "" ? undefined : description,
                        date: dateValue,
                        categoryId: categoryId || undefined,
                    });
                } else if (selectedCoordinates) {
                    await onSave({
                        long: selectedCoordinates.long,
                        lat: selectedCoordinates.lat,
                        description:
                            description.trim() === "" ? undefined : description,
                        date: dateValue,
                        categoryId: categoryId || undefined,
                    });
                }

                setDescription("");
                setDateValue(getTodayYyyymmdd());
                setCategoryId("");
            } catch (error) {
                setErrors(["Errore durante il salvataggio"]);
            }
        }
    };

    const handleCreateCategory = async (description: string, color: string) => {
        const category = await onCreateCategory(description, color);
        setCategoryId(category ? category.id : "");
    };

    const isEditMode = !!pointToEdit;

    return (
        <div className="c-mapPoint-form">
            <h2>{fm("addMapPoint")}</h2>
            <form onSubmit={handleSubmit}>
                <div className="c-form-group">
                    <label htmlFor="description">{fm("description")}:</label>
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
                <div className="c-form-group">
                    <label htmlFor="category">{fm("category")}:</label>
                    <div className="c-category-field">
                        <Select
                            id="category"
                            value={categoryId}
                            options={categories.map((cat) => ({
                                value: cat.id,
                                label: cat.description,
                                prefixComponent: (
                                    <div
                                        className="c-category-color-dot"
                                        style={{
                                            backgroundColor: cat.color,
                                        }}
                                    />
                                ),
                            }))}
                            placeholder={
                                categories.length > 0
                                    ? intl.formatMessage({
                                          id: "components.MapPointForm.selectCategory",
                                      })
                                    : intl.formatMessage({
                                          id: "components.MapPointForm.noCategories",
                                      })
                            }
                            onChange={setCategoryId}
                        />
                        <Button
                            type="button"
                            onClick={() => setIsCategoryModalOpen(true)}
                            kind="primary"
                            size="icon"
                            title={intl.formatMessage({
                                id: "components.MapPointForm.addNewCategory",
                            })}
                            disabled={loadingCategory}
                            loading={loadingCategory}
                        >
                            <Plus size={20} />
                        </Button>
                    </div>
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
                    disabled={!isEditMode && !selectedCoordinates}
                    loading={loading}
                >
                    <span key="button-text">
                        {loading
                            ? isEditMode
                                ? fm("updating")
                                : fm("saving")
                            : isEditMode
                              ? fm("update")
                              : fm("save")}
                    </span>
                </Button>
            </form>
            {!isEditMode && (
                <div className="c-instructions">
                    <MapPin size={18} />
                    <p>{fm("clickOnMapInstructions")}</p>
                </div>
            )}
            <CategoryModal
                isOpen={isCategoryModalOpen}
                onClose={() => setIsCategoryModalOpen(false)}
                onSave={handleCreateCategory}
                loading={loadingCategory}
            />
        </div>
    );
};
