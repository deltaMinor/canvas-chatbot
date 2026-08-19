import React from "react";

import { useActiveSection } from "#root/hooks/layoutHooks";
import { DetailsSectionType } from "#root/interfaces/sidebar";

import { useSetDiagramView } from "../projectDiagramFeatureHooks";

export const useDiagramViewActiveSectionEffect = () => {
    const activeSection = useActiveSection();
    const setDiagramView = useSetDiagramView();

    React.useEffect(() => {
        if (activeSection === DetailsSectionType.VISUALIZER.toString()) {
            setDiagramView("visualizer");
            return;
        }

        if (activeSection === DetailsSectionType.DIAGRAM.toString()) {
            setDiagramView("editor");
            return;
        }
    }, [activeSection, setDiagramView]);
};

export default useDiagramViewActiveSectionEffect;
