import React from "react";

import { useDiagramDrawerState } from "./projectDiagramFeatureHooks";

export const useIsDiagramThreatDrawerEdgesOpen = () => {
    const drawerState = useDiagramDrawerState();

    return React.useMemo(
        () => !!drawerState.diagram_threat_scenario_edges,
        [drawerState.diagram_threat_scenario_edges]
    );
};
