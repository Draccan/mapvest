import { MapPin, AlertCircle, Plus } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { useIntl } from "react-intl";

import type { CategoryDto } from "../../../core/dtos/CategoryDto";
import type { CreateMapPointDto } from "../../../core/dtos/CreateMapPointDto";
import type { MapPointDto } from "../../../core/dtos/MapPointDto";
import type { UpdateMapPointDto } from "../../../core/dtos/UpdateMapPointDto";
import getFormattedMessageWithScope from "../../../utils/getFormattedMessageWithScope";
import { Button } from "../Button";
import { CategoryModal } from "../CategoryModal";
import { Select } from "../Select";
import { SelectionPopover } from "../SelectionPopover";
import "./style.css";

const fm = getFormattedMessageWithScope("components.MapPointForm");

const getTodayYyyymmdd = (): string => {
    return new Date().toISOString().split("T")[0];
};

const getTomorrowYyyymmdd = (): string => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
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
    mapId?: string | number;
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
    mapId,
}) => {
    const intl = useIntl();
    const [description, setDescription] = useState<string>("");
    const [dateValue, setDateValue] = useState(getTodayYyyymmdd());
    const [dueDateValue, setDueDateValue] = useState<string | undefined>(
        undefined,
    );
    const [showDueDate, setShowDueDate] = useState(false);
    const [notesValue, setNotesValue] = useState<string>("");
    const [showNotes, setShowNotes] = useState(false);
    const [categoryId, setCategoryId] = useState<string>("");
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [isAddFieldPopoverOpen, setIsAddFieldPopoverOpen] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);
    const addFieldButtonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (pointToEdit) {
            setDescription(pointToEdit.description || "");
            setDateValue(pointToEdit.date);
            setDueDateValue(pointToEdit.dueDate);
            setShowDueDate(!!pointToEdit.dueDate);
            setNotesValue(pointToEdit.notes || "");
            setShowNotes(!!pointToEdit.notes);
            setCategoryId(pointToEdit.categoryId || "");
        } else {
            setDescription("");
            setDateValue(getTodayYyyymmdd());
            setDueDateValue(undefined);
            setShowDueDate(false);
            setNotesValue("");
            setShowNotes(false);
            setCategoryId("");
        }
    }, [pointToEdit]);

    useEffect(() => {
        if (mapId !== undefined) {
            setDescription("");
            setDateValue(getTodayYyyymmdd());
            setDueDateValue(undefined);
            setShowDueDate(false);
            setNotesValue("");
            setShowNotes(false);
            setCategoryId("");
            setErrors([]);
        }
    }, [mapId]);

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
                        dueDate: dueDateValue || undefined,
                        notes:
                            notesValue.trim() === "" ? undefined : notesValue,
                        categoryId: categoryId || undefined,
                    });
                } else if (selectedCoordinates) {
                    await onSave({
                        long: selectedCoordinates.long,
                        lat: selectedCoordinates.lat,
                        description:
                            description.trim() === "" ? undefined : description,
                        date: dateValue,
                        dueDate: dueDateValue || undefined,
                        notes:
                            notesValue.trim() === "" ? undefined : notesValue,
                        categoryId: categoryId || undefined,
                    });
                }

                setDescription("");
                setDateValue(getTodayYyyymmdd());
                setDueDateValue(undefined);
                setShowDueDate(false);
                setNotesValue("");
                setShowNotes(false);
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
        <div className="c-map-point-form">
            <h2>{fm("addMapPoint")}</h2>
            <form onSubmit={handleSubmit}>
                <div className="c-map-point-form-group">
                    <label htmlFor="description">{fm("description")}:</label>
                    <input
                        type="text"
                        id="description"
                        value={description}
                        className="c-map-point-form-description-input"
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>
                <div className="c-map-point-form-group">
                    <label htmlFor="date">{fm("date")}:</label>
                    <input
                        type="date"
                        id="date"
                        value={dateValue}
                        onChange={(e) => setDateValue(e.target.value)}
                        className="c-map-point-form-date-input"
                    />
                </div>
                <div className="c-map-point-form-group">
                    <label htmlFor="category">{fm("category")}:</label>
                    <div className="c-map-point-form-category-field">
                        <Select
                            id="category"
                            value={categoryId}
                            options={categories.map((cat) => ({
                                value: cat.id,
                                label: cat.description,
                                prefixComponent: (
                                    <div
                                        className="c-map-point-form-category-color-dot"
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
                {showDueDate && (
                    <div className="c-map-point-form-group">
                        <label htmlFor="dueDate">{fm("dueDate")}:</label>
                        <input
                            type="date"
                            id="dueDate"
                            value={dueDateValue || ""}
                            min={getTomorrowYyyymmdd()}
                            onChange={(e) => setDueDateValue(e.target.value)}
                            className="c-map-point-form-date-input"
                        />
                    </div>
                )}
                {showNotes && (
                    <div className="c-map-point-form-group">
                        <label htmlFor="notes">{fm("notes")}:</label>
                        <textarea
                            id="notes"
                            value={notesValue}
                            maxLength={300}
                            onChange={(e) => setNotesValue(e.target.value)}
                            className="c-map-point-form-notes-textarea"
                            rows={4}
                        />
                        <div className="c-map-point-form-notes-counter">
                            {notesValue.length}/300
                        </div>
                    </div>
                )}
                <div className="c-map-point-form-add-field-wrapper">
                    <Button
                        ref={addFieldButtonRef}
                        type="button"
                        onClick={() =>
                            setIsAddFieldPopoverOpen(!isAddFieldPopoverOpen)
                        }
                        kind="secondary"
                        size="small"
                        className="c-map-point-form-add-field-button"
                        fullWidth={false}
                    >
                        <Plus size={16} />
                        <span>{fm("addOtherFields")}</span>
                    </Button>
                    <SelectionPopover
                        isOpen={isAddFieldPopoverOpen}
                        onClose={() => setIsAddFieldPopoverOpen(false)}
                        anchorElement={addFieldButtonRef.current}
                        options={[
                            {
                                id: "dueDate",
                                label: intl.formatMessage({
                                    id: "components.MapPointForm.dueDate",
                                }),
                                disabled: showDueDate,
                                onSelect: () => setShowDueDate(true),
                            },
                            {
                                id: "notes",
                                label: intl.formatMessage({
                                    id: "components.MapPointForm.notes",
                                }),
                                disabled: showNotes,
                                onSelect: () => setShowNotes(true),
                            },
                        ]}
                    />
                </div>
                {errors.length > 0 && (
                    <div className="c-map-point-form-errors">
                        {errors.map((error, index) => (
                            <div key={index} className="c-map-point-form-error">
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
                <div className="c-map-point-form-instructions">
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
