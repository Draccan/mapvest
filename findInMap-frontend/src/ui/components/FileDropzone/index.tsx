import { FileUp } from "lucide-react";
import React, { useRef, useState } from "react";

import getFormattedMessageWithScope from "../../../utils/getFormattedMessageWithScope";
import { Button } from "../Button";
import "./style.css";

const fm = getFormattedMessageWithScope("components.FileDropzone");

interface FileDropzoneProps {
    accept: string[];
    onFileSelect: (file: File) => void;
    disabled?: boolean;
    buttonText?: string;
    dropzoneText?: string;
}

export const FileDropzone: React.FC<FileDropzoneProps> = ({
    accept,
    onFileSelect,
    disabled = false,
    buttonText,
    dropzoneText,
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleSelectFile = () => {
        if (!disabled) {
            fileInputRef.current?.click();
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onFileSelect(file);
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
    };

    const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        if (!disabled) {
            setIsDragging(true);
        }
    };

    const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(false);

        if (disabled) return;

        const droppedFile = event.dataTransfer.files?.[0];
        if (droppedFile) {
            onFileSelect(droppedFile);
        }
    };

    return (
        <div
            className={`c-filedropzone ${isDragging ? "c-filedropzone-active" : ""} ${disabled ? "c-filedropzone-disabled" : ""}`}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleSelectFile}
        >
            <input
                ref={fileInputRef}
                type="file"
                accept={accept.join(",")}
                onChange={handleFileChange}
                className="c-filedropzone-input"
            />
            <FileUp size={32} className="c-filedropzone-icon" />
            <span className="c-filedropzone-text">
                {dropzoneText || fm("dropzoneText")}
            </span>
            <Button
                kind="secondary"
                onClick={(e) => {
                    e.stopPropagation();
                    handleSelectFile();
                }}
                disabled={disabled}
            >
                {buttonText || fm("selectFile")}
            </Button>
        </div>
    );
};
