import { AlertCircle, X } from "lucide-react";
import React, { useState } from "react";
import { useIntl } from "react-intl";

import getFormattedMessageWithScope from "../../../utils/getFormattedMessageWithScope";
import { Button } from "../Button";
import "./style.css";

const fm = getFormattedMessageWithScope("components.CategoryModal");

interface CategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (description: string, color: string) => Promise<void>;
    loading: boolean;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
    isOpen,
    onClose,
    onSave,
    loading,
}) => {
    const intl = useIntl();
    const [description, setDescription] = useState("");
    const defaultColor = "#FF5733";
    const [color, setColor] = useState(defaultColor);
    const [errors, setErrors] = useState<string[]>([]);

    const resetForm = () => {
        setDescription("");
        setColor(defaultColor);
        setErrors([]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const newErrors: string[] = [];

        if (!description.trim()) {
            newErrors.push(
                intl.formatMessage({
                    id: "components.CategoryModal.descriptionRequired",
                }),
            );
        }

        if (!color) {
            newErrors.push(
                intl.formatMessage({
                    id: "components.CategoryModal.colorRequired",
                }),
            );
        }

        setErrors(newErrors);

        if (newErrors.length === 0) {
            try {
                await onSave(description, color);
                resetForm();
                onClose();
            } catch (error) {
                setErrors(["Error saving category"]);
            }
        }
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="c-categoryModal-overlay" onClick={handleClose}>
            <div
                className="c-categoryModal-content"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="c-categoryModal-header">
                    <h2>{fm("title")}</h2>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="c-categoryModal-close"
                        aria-label={intl.formatMessage({
                            id: "components.CategoryModal.cancel",
                        })}
                    >
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="c-categoryModal-form-group">
                        <label htmlFor="categoryDescription">
                            {fm("description")}:
                        </label>
                        <input
                            type="text"
                            id="categoryDescription"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="c-categoryModal-description-input"
                            autoFocus
                        />
                    </div>
                    <div className="c-categoryModal-form-group">
                        <label htmlFor="categoryColor">{fm("color")}:</label>
                        <div className="c-categoryModal-color-picker-wrapper">
                            <input
                                type="color"
                                id="categoryColor"
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                                className="c-categoryModal-color-picker"
                            />
                            <input
                                type="text"
                                value={color}
                                readOnly
                                disabled
                                className="c-categoryModal-color-input"
                                placeholder={defaultColor}
                            />
                        </div>
                    </div>
                    {errors.length > 0 && (
                        <div className="c-categoryModal-errors">
                            {errors.map((error, index) => (
                                <div
                                    key={index}
                                    className="c-categoryModal-error"
                                >
                                    <AlertCircle size={16} />
                                    <span>{error}</span>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="c-categoryModal-actions">
                        <Button
                            type="button"
                            kind="primary"
                            onClick={handleClose}
                            disabled={loading}
                        >
                            {fm("cancel")}
                        </Button>
                        <Button type="submit" kind="primary" loading={loading}>
                            {loading ? fm("saving") : fm("save")}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
