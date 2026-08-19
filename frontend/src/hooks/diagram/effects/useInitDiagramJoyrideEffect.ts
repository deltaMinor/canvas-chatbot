import React from "react";
import { useSelector } from "react-redux";

import { useProjectDiagram } from "#root/hooks/backendHooks";
import { DetailsSectionType } from "#root/interfaces/sidebar";
import { RootState } from "#root/redux/store";
import { getFromUserLocalStorage } from "#root/utils/localStorage";

import { useDiagramView, useJoyrideView, useSetDiagramView } from "../projectDiagramFeatureHooks";

export const useInitDiagramJoyrideEffect = () => {
    const activeSection = useSelector<RootState, string>((state) => state.layout.activeSection);
    const projectDiagram = useProjectDiagram();
    const diagramView = useDiagramView();
    const joyrideView = useJoyrideView();
    const setDiagramView = useSetDiagramView();
    const isCompleted = projectDiagram?.isCompleted;

    React.useEffect(() => {
        if (joyrideView) {
            return;
        }

        if (activeSection !== DetailsSectionType.VISUALIZER.toString()) {
            const hideTutorial = getFromUserLocalStorage("hideTutorial") === "true";
            const initDiagramView = !hideTutorial && !isCompleted ? "joyride" : "editor";

            if (diagramView !== initDiagramView) {
                setDiagramView(initDiagramView);
            }
        }
    }, [activeSection, diagramView, isCompleted, joyrideView, setDiagramView]);
};

export default useInitDiagramJoyrideEffect;
