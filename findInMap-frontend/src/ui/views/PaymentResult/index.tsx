import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { CheckCircle, XCircle, Compass } from "lucide-react";

import { useGroupsMaps } from "../../../core/contexts/GroupsMapsContext";
import getFormattedMessageWithScope from "../../../utils/getFormattedMessageWithScope";
import routes from "../../commons/routes";
import "./style.css";

const fm = getFormattedMessageWithScope("views.PaymentResult");

export enum PaymentResultVariant {
    Success = "success",
    Cancelled = "cancelled",
}

interface PaymentResultProps {
    variant: PaymentResultVariant;
}

export const PaymentResult: React.FC<PaymentResultProps> = ({ variant }) => {
    const { refreshGroups } = useGroupsMaps();
    const location = useLocation();

    useEffect(() => {
        if (variant === PaymentResultVariant.Success) {
            refreshGroups();
        }
    }, [location.pathname]);

    const isSuccess = variant === PaymentResultVariant.Success;

    return (
        <div className="v-paymentresult-container">
            <div className="v-paymentresult-content">
                <div className="v-paymentresult-icon">
                    {isSuccess ? (
                        <CheckCircle
                            size={64}
                            className="v-paymentresult-icon-success"
                        />
                    ) : (
                        <XCircle
                            size={64}
                            className="v-paymentresult-icon-cancelled"
                        />
                    )}
                </div>
                <h1 className="v-paymentresult-title">
                    {fm(isSuccess ? "successTitle" : "cancelledTitle")}
                </h1>
                <p className="v-paymentresult-description">
                    {fm(isSuccess ? "successMessage" : "cancelledMessage")}
                </p>
                <div className="v-paymentresult-actions">
                    <Link to={routes.home()} className="v-paymentresult-button">
                        <Compass size={18} />
                        {fm("backToMap")}
                    </Link>
                </div>
            </div>
        </div>
    );
};
