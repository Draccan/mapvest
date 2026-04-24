import React, { useEffect, useMemo, useState } from "react";
import {
    ACTIONS,
    EVENTS,
    Joyride,
    STATUS,
    type EventData,
    type Step,
} from "react-joyride";
import { useIntl } from "react-intl";

import "./style.css";

const STORAGE_KEY = "MapVest-homeTourDismissed";

const FONT_FAMILY =
    '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

const ANALYSIS_TOGGLE_STEP = 5;
const DRAW_STEP = 6;

interface HomeTourProps {
    ready: boolean;
    isAnalysisMode: boolean;
    onEnterAnalysisMode: () => void;
}

export const HomeTour: React.FC<HomeTourProps> = ({
    ready,
    isAnalysisMode,
    onEnterAnalysisMode,
}) => {
    const intl = useIntl();
    const [run, setRun] = useState(false);
    const [stepIndex, setStepIndex] = useState(0);

    useEffect(() => {
        if (!ready) return;
        if (localStorage.getItem(STORAGE_KEY) === "true") return;
        setRun(true);
    }, [ready]);

    useEffect(() => {
        if (run && stepIndex === ANALYSIS_TOGGLE_STEP && isAnalysisMode) {
            setStepIndex(DRAW_STEP);
        }
    }, [isAnalysisMode, run, stepIndex]);

    const steps = useMemo<Step[]>(
        () => [
            {
                target: "body",
                placement: "center",
                title: intl.formatMessage({
                    id: "components.HomeTour.welcomeTitle",
                }),
                content: intl.formatMessage({
                    id: "components.HomeTour.welcome",
                }),
                skipBeacon: true,
            },
            {
                target: ".v-home-map",
                placement: "right",
                title: intl.formatMessage({
                    id: "components.HomeTour.mapClickTitle",
                }),
                content: intl.formatMessage({
                    id: "components.HomeTour.mapClick",
                }),
                skipBeacon: true,
            },
            {
                target: ".v-home-form-section",
                placement: "left",
                title: intl.formatMessage({
                    id: "components.HomeTour.fillFormTitle",
                }),
                content: intl.formatMessage({
                    id: "components.HomeTour.fillForm",
                }),
                skipBeacon: true,
            },
            {
                target: ".v-home-form-section",
                placement: "left-start",
                title: intl.formatMessage({
                    id: "components.HomeTour.categoriesTitle",
                }),
                content: intl.formatMessage({
                    id: "components.HomeTour.categories",
                }),
                skipBeacon: true,
            },
            {
                target: ".v-home-import-btn",
                placement: "bottom",
                title: intl.formatMessage({
                    id: "components.HomeTour.importExcelTitle",
                }),
                content: intl.formatMessage({
                    id: "components.HomeTour.importExcel",
                }),
                skipBeacon: true,
                blockTargetInteraction: true,
            },
            {
                target: ".v-home-analysis-toggle",
                placement: "bottom",
                title: intl.formatMessage({
                    id: "components.HomeTour.analysisModeTitle",
                }),
                content: intl.formatMessage({
                    id: "components.HomeTour.analysisMode",
                }),
                skipBeacon: true,
            },
            {
                target: ".leaflet-pm-toolbar",
                placement: "right",
                title: intl.formatMessage({
                    id: "components.HomeTour.drawAreaTitle",
                }),
                content: intl.formatMessage({
                    id: "components.HomeTour.drawArea",
                }),
                skipBeacon: true,
            },
            {
                target: ".v-home-form-section",
                placement: "left",
                title: intl.formatMessage({
                    id: "components.HomeTour.optimizeRouteTitle",
                }),
                content: intl.formatMessage({
                    id: "components.HomeTour.optimizeRoute",
                }),
                skipBeacon: true,
            },
            {
                target: ".v-home-form-section",
                placement: "left-start",
                title: intl.formatMessage({
                    id: "components.HomeTour.routeDetailsTitle",
                }),
                content: intl.formatMessage({
                    id: "components.HomeTour.routeDetails",
                }),
                skipBeacon: true,
            },
            {
                target: "body",
                placement: "center",
                title: intl.formatMessage({
                    id: "components.HomeTour.doneTitle",
                }),
                content: intl.formatMessage({
                    id: "components.HomeTour.done",
                }),
                skipBeacon: true,
            },
        ],
        [intl],
    );

    const locale = useMemo(
        () => ({
            back: intl.formatMessage({ id: "components.HomeTour.back" }),
            close: intl.formatMessage({ id: "components.HomeTour.skip" }),
            last: intl.formatMessage({ id: "components.HomeTour.last" }),
            next: intl.formatMessage({ id: "components.HomeTour.next" }),
            skip: intl.formatMessage({ id: "components.HomeTour.skip" }),
        }),
        [intl],
    );

    const finishTour = () => {
        localStorage.setItem(STORAGE_KEY, "true");
        setRun(false);
    };

    const handleEvent = (data: EventData) => {
        const finished: string[] = [STATUS.FINISHED, STATUS.SKIPPED];
        if (finished.includes(data.status)) {
            finishTour();
            return;
        }

        if (data.type === EVENTS.STEP_AFTER) {
            if (data.action === ACTIONS.NEXT) {
                if (data.index === ANALYSIS_TOGGLE_STEP && !isAnalysisMode) {
                    onEnterAnalysisMode();
                }
                setStepIndex(data.index + 1);
            } else if (data.action === ACTIONS.PREV) {
                setStepIndex(Math.max(0, data.index - 1));
            }
            return;
        }

        if (data.type === EVENTS.TARGET_NOT_FOUND) {
            setStepIndex(data.index + 1);
        }
    };

    return (
        <div className="c-home-tour">
            <Joyride
                run={run}
                stepIndex={stepIndex}
                steps={steps}
                continuous
                locale={locale}
                onEvent={handleEvent}
                options={{
                    buttons: ["back", "skip", "primary"],
                    closeButtonAction: "skip",
                    overlayClickAction: "close",
                    showProgress: true,
                    skipBeacon: true,
                    targetWaitTimeout: 3000,
                    zIndex: 10000,
                    primaryColor: "var(--color-primary)",
                    textColor: "var(--color-text-primary)",
                    backgroundColor: "var(--color-background-primary)",
                    arrowColor: "var(--color-background-primary)",
                    overlayColor: "rgba(0, 0, 0, 0.5)",
                }}
                styles={{
                    tooltipContainer: {
                        textAlign: "left",
                        fontFamily: FONT_FAMILY,
                    },
                    tooltipTitle: {
                        fontSize: "1.1rem",
                        fontWeight: 600,
                        margin: 0,
                        fontFamily: FONT_FAMILY,
                    },
                    tooltipContent: {
                        padding: "12px 0",
                        fontSize: "0.95rem",
                        lineHeight: 1.5,
                        fontFamily: FONT_FAMILY,
                    },
                    buttonBack: {
                        color: "var(--color-text-secondary)",
                        fontFamily: FONT_FAMILY,
                    },
                    buttonSkip: {
                        color: "var(--color-text-muted)",
                        fontFamily: FONT_FAMILY,
                    },
                    buttonPrimary: {
                        backgroundColor: "var(--color-primary)",
                        color: "#ffffff",
                        borderRadius: "8px",
                        fontFamily: FONT_FAMILY,
                    },
                }}
            />
        </div>
    );
};
