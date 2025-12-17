import React, { useEffect, useRef } from "react";

import "./style.css";

interface PopoverProps {
    isOpen: boolean;
    onClose: () => void;
    anchorElement: HTMLElement | null;
    children: React.ReactNode;
}

export const Popover: React.FC<PopoverProps> = ({
    isOpen,
    onClose,
    anchorElement,
    children,
}) => {
    const popoverRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                popoverRef.current &&
                !popoverRef.current.contains(event.target as Node) &&
                anchorElement &&
                !anchorElement.contains(event.target as Node)
            ) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen, onClose, anchorElement]);

    return isOpen ? (
        <div ref={popoverRef} className="c-popover">
            {children}
        </div>
    ) : null;
};
