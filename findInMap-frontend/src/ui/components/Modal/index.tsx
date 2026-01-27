import { X } from "lucide-react";
import React, { useEffect } from "react";
import { createPortal } from "react-dom";

import { Button } from "../Button";
import "./style.css";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title?: string | React.ReactNode;
    isCloseDisabled?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    children,
    title,
    isCloseDisabled = false,
}) => {
    // Docs: needed to prevent background scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape" && !isCloseDisabled) {
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener("keydown", handleEscape);
        }
        return () => {
            document.removeEventListener("keydown", handleEscape);
        };
    }, [isOpen, onClose, isCloseDisabled]);

    if (!isOpen) return null;

    return createPortal(
        <div
            className="c-modal-overlay"
            onClick={isCloseDisabled ? undefined : onClose}
        >
            <div
                className="c-modal-container"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="c-modal-header">
                    {title && <h2 className="c-modal-title">{title}</h2>}
                    <Button
                        kind="secondary"
                        size="icon"
                        onClick={onClose}
                        className="c-modal-close"
                        disabled={isCloseDisabled}
                    >
                        <X size={20} />
                    </Button>
                </div>
                <div className="c-modal-content">{children}</div>
            </div>
        </div>,
        document.body,
    );
};
