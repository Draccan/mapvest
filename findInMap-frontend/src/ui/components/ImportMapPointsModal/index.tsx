import { AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react";
import React, { useState } from "react";
import { useIntl } from "react-intl";

import type { ImportMapPointsResultDto } from "../../../core/dtos/ImportMapPointsResultDto";
import getFormattedMessageWithScope from "../../../utils/getFormattedMessageWithScope";
import { Button } from "../Button";
import { FileDropzone } from "../FileDropzone";
import { Modal } from "../Modal";
import "./style.css";

interface ImportMapPointsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (file: File) => Promise<ImportMapPointsResultDto | null>;
    loading: boolean;
}

const ALLOWED_EXTENSIONS = [".xlsx", ".xls", ".csv"];
const MAX_ROWS = 1000;

const fm = getFormattedMessageWithScope("components.ImportMapPointsModal");

export const ImportMapPointsModal: React.FC<ImportMapPointsModalProps> = ({
    isOpen,
    onClose,
    onImport,
    loading,
}) => {
    const intl = useIntl();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [fileError, setFileError] = useState<string | null>(null);
    const [importResult, setImportResult] =
        useState<ImportMapPointsResultDto | null>(null);

    const resetState = () => {
        setSelectedFile(null);
        setFileError(null);
        setImportResult(null);
    };

    const handleClose = () => {
        resetState();
        onClose();
    };

    const validateFile = (file: File): boolean => {
        const extension = file.name
            .toLowerCase()
            .substring(file.name.lastIndexOf("."));
        if (!ALLOWED_EXTENSIONS.includes(extension)) {
            setFileError(
                intl.formatMessage(
                    { id: "components.ImportMapPointsModal.invalidFileType" },
                    { types: ALLOWED_EXTENSIONS.join(", ") },
                ),
            );
            return false;
        }
        setFileError(null);
        return true;
    };

    const handleFileSelect = (file: File) => {
        if (validateFile(file)) {
            setSelectedFile(file);
            setImportResult(null);
        } else {
            setSelectedFile(null);
        }
    };

    const handleImport = async () => {
        if (!selectedFile) return;

        const result = await onImport(selectedFile);
        if (result) {
            setImportResult(result);
            setSelectedFile(null);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={fm("title")}
            isCloseDisabled={loading}
        >
            <div className="c-import-modal">
                {!importResult ? (
                    <>
                        <div className="c-import-modal-info">
                            <Info
                                size={20}
                                className="c-import-modal-info-icon"
                            />
                            <p>{fm("description")}</p>
                        </div>

                        <div className="c-import-modal-columns">
                            <h4>{fm("columnsTitle")}</h4>
                            <ul>
                                <li>
                                    <strong>{fm("columnDescription")}</strong> *{" "}
                                    <span className="c-import-modal-column-hint">
                                        ({fm("columnRequired")})
                                    </span>
                                </li>
                                <li>
                                    <strong>{fm("columnLatitude")}</strong> *{" "}
                                    <span className="c-import-modal-column-hint">
                                        ({fm("columnRequired")})
                                    </span>
                                </li>
                                <li>
                                    <strong>{fm("columnLongitude")}</strong> *{" "}
                                    <span className="c-import-modal-column-hint">
                                        ({fm("columnRequired")})
                                    </span>
                                </li>
                                <li>
                                    <strong>{fm("columnDate")}</strong>{" "}
                                    <span className="c-import-modal-column-hint">
                                        ({fm("columnDateHint")})
                                    </span>
                                </li>
                                <li>
                                    <strong>{fm("columnDueDate")}</strong>{" "}
                                    <span className="c-import-modal-column-hint">
                                        ({fm("columnOptional")})
                                    </span>
                                </li>
                                <li>
                                    <strong>{fm("columnNotes")}</strong>{" "}
                                    <span className="c-import-modal-column-hint">
                                        ({fm("columnOptional")})
                                    </span>
                                </li>
                                <li>
                                    <strong>{fm("columnCategory")}</strong>{" "}
                                    <span className="c-import-modal-column-hint">
                                        ({fm("columnCategoryHint")})
                                    </span>
                                </li>
                            </ul>
                        </div>

                        <div className="c-import-modal-warning">
                            <AlertTriangle
                                size={16}
                                className="c-import-modal-warning-icon"
                            />
                            <span>
                                {fm({
                                    id: "maxRowsWarning",
                                    values: { max: MAX_ROWS },
                                })}
                            </span>
                        </div>

                        <div className="c-import-modal-dropzone-wrapper">
                            <FileDropzone
                                accept={ALLOWED_EXTENSIONS}
                                onFileSelect={handleFileSelect}
                                disabled={loading}
                                buttonText={intl.formatMessage({
                                    id: "components.ImportMapPointsModal.selectFile",
                                })}
                                dropzoneText={intl.formatMessage({
                                    id: "components.ImportMapPointsModal.dropzoneText",
                                })}
                            />
                        </div>
                        {selectedFile && (
                            <div className="c-import-modal-file-info">
                                <span className="c-import-modal-file-name">
                                    {selectedFile.name}
                                </span>
                            </div>
                        )}
                        {fileError && (
                            <span className="c-import-modal-file-error">
                                {fileError}
                            </span>
                        )}

                        <div className="c-import-modal-actions">
                            <Button
                                kind="secondary"
                                onClick={handleClose}
                                disabled={loading}
                            >
                                {fm("cancel")}
                            </Button>
                            <Button
                                kind="primary"
                                onClick={handleImport}
                                disabled={!selectedFile || loading}
                            >
                                {loading ? fm("importing") : fm("import")}
                            </Button>
                        </div>
                    </>
                ) : (
                    <div className="c-import-modal-result">
                        <div className="c-import-modal-result-summary">
                            <div className="c-import-modal-result-item c-import-modal-result-success">
                                <CheckCircle size={20} />
                                <span>
                                    {fm({
                                        id: "successCount",
                                        values: {
                                            count: importResult.successCount,
                                        },
                                    })}
                                </span>
                            </div>
                            {importResult.errorCount > 0 && (
                                <div className="c-import-modal-result-item c-import-modal-result-error">
                                    <XCircle size={20} />
                                    <span>
                                        {fm({
                                            id: "errorCount",
                                            values: {
                                                count: importResult.errorCount,
                                            },
                                        })}
                                    </span>
                                </div>
                            )}
                        </div>

                        {importResult.errors.length > 0 && (
                            <div className="c-import-modal-errors">
                                <h4>{fm("errorsTitle")}</h4>
                                <div className="c-import-modal-errors-list">
                                    {importResult.errors.map((error, index) => (
                                        <div
                                            key={index}
                                            className="c-import-modal-error-row"
                                        >
                                            <span className="c-import-modal-error-row-num">
                                                {fm({
                                                    id: "row",
                                                    values: { row: error.row },
                                                })}
                                            </span>
                                            <span className="c-import-modal-error-message">
                                                {error.error}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="c-import-modal-actions">
                            <Button kind="primary" onClick={handleClose}>
                                {fm("close")}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
};
