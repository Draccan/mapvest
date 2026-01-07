import { LifeBuoy } from "lucide-react";
import React from "react";
import { useIntl } from "react-intl";

import { Button } from "../Button";
import "./style.css";

export const SupportBox: React.FC = () => {
    const intl = useIntl();

    const ariaLabel = intl.formatMessage({
        id: "components.SupportBox.contactSupport",
    });

    const handleClick = () => {
        const subject = encodeURIComponent(
            intl.formatMessage({ id: "components.SupportBox.emailSubject" }),
        );
        const body = encodeURIComponent(
            intl.formatMessage({ id: "components.SupportBox.emailBody" }),
        );
        window.location.href = `mailto:support@map-vest.com?subject=${subject}&body=${body}`;
    };

    return (
        <Button
            kind="primary"
            size="icon"
            className="c-supportbox"
            onClick={handleClick}
            aria-label={ariaLabel}
            title={ariaLabel}
            fullWidth={false}
        >
            <LifeBuoy size={24} />
        </Button>
    );
};
