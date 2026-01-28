import React from "react";

import getFormattedMessageWithScope from "../../../utils/getFormattedMessageWithScope";
import { Button } from "../Button";
import { Modal } from "../Modal";
import "./style.css";

const fm = getFormattedMessageWithScope("components.DeleteCategoryModal");

interface DeleteCategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    loading: boolean;
}

export const DeleteCategoryModal: React.FC<DeleteCategoryModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    loading,
}) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={fm("title")}
            isCloseDisabled={loading}
        >
            <div className="c-delete-category-modal-content">
                <p>{fm("message")}</p>
                <div className="c-delete-category-modal-actions">
                    <Button
                        type="button"
                        kind="secondary"
                        onClick={onClose}
                        disabled={loading}
                    >
                        {fm("cancel")}
                    </Button>
                    <Button
                        type="button"
                        kind="danger"
                        onClick={onConfirm}
                        loading={loading}
                        disabled={loading}
                    >
                        {fm("confirm")}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
