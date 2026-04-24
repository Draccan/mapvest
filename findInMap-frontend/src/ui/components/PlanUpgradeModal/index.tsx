import { Check, Crown, MapPin } from "lucide-react";
import React from "react";

import { Plan } from "../../../core/commons/enums";
import { usePlanUpgrade } from "../../../core/contexts/PlanUpgradeContext";
import { useGroupsMaps } from "../../../core/contexts/GroupsMapsContext";
import { useCreateCheckoutSession } from "../../../core/usecases/useCreateCheckoutSession";
import getFormattedMessageWithScope from "../../../utils/getFormattedMessageWithScope";
import { Button } from "../Button";
import { Modal } from "../Modal";
import "./style.css";

const fm = getFormattedMessageWithScope("components.PlanUpgradeModal");

export const PlanUpgradeModal: React.FC = () => {
    const { isOpen, hidePlanUpgrade } = usePlanUpgrade();
    const { selectedGroup } = useGroupsMaps();
    const { createCheckoutSession, loading: checkoutLoading } =
        useCreateCheckoutSession();

    const currentPlan = selectedGroup?.plan ?? Plan.Free;

    return (
        <Modal isOpen={isOpen || true} onClose={hidePlanUpgrade}>
            <div className="c-planupgrademodal">
                <div className="c-planupgrademodal-header">
                    <Crown
                        size={32}
                        className="c-planupgrademodal-header-icon"
                    />
                    <h2 className="c-planupgrademodal-header-title">
                        {fm("title")}
                    </h2>
                    <p className="c-planupgrademodal-header-subtitle">
                        {fm("subtitle")}
                    </p>
                </div>
                <div className="c-planupgrademodal-cards">
                    <div
                        className={`c-planupgrademodal-card ${currentPlan === Plan.Free ? "c-planupgrademodal-card-active" : ""}`}
                    >
                        {currentPlan === Plan.Free && (
                            <div className="c-planupgrademodal-card-badge">
                                {fm("currentPlan")}
                            </div>
                        )}
                        <div className="c-planupgrademodal-card-header">
                            <MapPin
                                size={24}
                                className="c-planupgrademodal-card-icon-free"
                            />
                            <h3 className="c-planupgrademodal-card-name">
                                {fm("freePlanName")}
                            </h3>
                            <span className="c-planupgrademodal-card-price">
                                {fm("freePlanPrice")}
                            </span>
                        </div>
                        <ul className="c-planupgrademodal-card-features">
                            <li>
                                <Check
                                    size={16}
                                    className="c-planupgrademodal-feature-check"
                                />
                                {fm("featureMapPoints")}
                            </li>
                            <li>
                                <Check
                                    size={16}
                                    className="c-planupgrademodal-feature-check"
                                />
                                {fm("featureSupport")}
                            </li>
                            <li>
                                <Check
                                    size={16}
                                    className="c-planupgrademodal-feature-check"
                                />
                                {fm("featureRouteCalculation")}
                            </li>
                            <li>
                                <Check
                                    size={16}
                                    className="c-planupgrademodal-feature-check"
                                />
                                {fm("featurePublicLink")}
                            </li>
                            <li>
                                <Check
                                    size={16}
                                    className="c-planupgrademodal-feature-check"
                                />
                                {fm("featureMultipleMaps")}
                            </li>
                            <li>
                                <Check
                                    size={16}
                                    className="c-planupgrademodal-feature-check"
                                />
                                {fm("featureDashboard")}
                            </li>
                        </ul>
                    </div>
                    <div className="c-planupgrademodal-card c-planupgrademodal-card-pro">
                        {currentPlan === Plan.Pro && (
                            <div className="c-planupgrademodal-card-badge">
                                {fm("currentPlan")}
                            </div>
                        )}
                        <div className="c-planupgrademodal-card-badge-recommended">
                            <Crown size={14} />
                            {fm("upgradeToPro")}
                        </div>
                        <div className="c-planupgrademodal-card-header">
                            <Crown
                                size={24}
                                className="c-planupgrademodal-card-icon-pro"
                            />
                            <h3 className="c-planupgrademodal-card-name">
                                {fm("proPlanName")}
                            </h3>
                            <span className="c-planupgrademodal-card-price">
                                {fm("proPlanPrice")}
                            </span>
                        </div>
                        <ul className="c-planupgrademodal-card-features">
                            <li>
                                <Check
                                    size={16}
                                    className="c-planupgrademodal-feature-check-pro"
                                />
                                {fm("featureAllFreeFeatures")}
                            </li>
                            <li>
                                <Check
                                    size={16}
                                    className="c-planupgrademodal-feature-check-pro"
                                />
                                {fm("featureUnlimitedMapPoints")}
                            </li>
                            <li>
                                <Check
                                    size={16}
                                    className="c-planupgrademodal-feature-check-pro"
                                />
                                {fm("featurePrioritySupport")}
                            </li>
                        </ul>
                        <div className="c-planupgrademodal-card-action">
                            <Button
                                kind="primary"
                                disabled={
                                    checkoutLoading || currentPlan === Plan.Pro
                                }
                                onClick={() =>
                                    createCheckoutSession(selectedGroup!.id)
                                }
                            >
                                {checkoutLoading
                                    ? fm("upgradeButtonLoading")
                                    : fm("upgradeButton")}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};
