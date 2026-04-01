import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";

import { PLAN_UPGRADE_EVENT } from "../usecases/utils/useRequestWrapper";

interface PlanUpgradeContextType {
    isOpen: boolean;
    showPlanUpgrade: () => void;
    hidePlanUpgrade: () => void;
}

const PlanUpgradeContext = createContext<PlanUpgradeContextType | undefined>(
    undefined,
);

interface PlanUpgradeProviderProps {
    children: React.ReactNode;
}

export const PlanUpgradeProvider: React.FC<PlanUpgradeProviderProps> = ({
    children,
}) => {
    const [isOpen, setIsOpen] = useState(false);

    const showPlanUpgrade = useCallback(() => {
        setIsOpen(true);
    }, []);

    const hidePlanUpgrade = useCallback(() => {
        setIsOpen(false);
    }, []);

    useEffect(() => {
        const handler = () => showPlanUpgrade();
        window.addEventListener(PLAN_UPGRADE_EVENT, handler);
        return () => window.removeEventListener(PLAN_UPGRADE_EVENT, handler);
    }, [showPlanUpgrade]);

    return (
        <PlanUpgradeContext.Provider
            value={{ isOpen, showPlanUpgrade, hidePlanUpgrade }}
        >
            {children}
        </PlanUpgradeContext.Provider>
    );
};

export const usePlanUpgrade = (): PlanUpgradeContextType => {
    const context = useContext(PlanUpgradeContext);
    if (context === undefined) {
        throw new Error(
            "usePlanUpgrade must be used within a PlanUpgradeProvider",
        );
    }
    return context;
};
