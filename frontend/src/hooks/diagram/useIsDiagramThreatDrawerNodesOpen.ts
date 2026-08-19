import React from "react";

import { useDiagramDrawerState } from "./projectDiagramFeatureHooks";

export const useIsDiagramThreatDrawerNodesOpen = () => {
    const drawerState = useDiagramDrawerState();

    return React.useMemo(
        () => !!drawerState.diagram_threat_scenario_nodes,
        [drawerState.diagram_threat_scenario_nodes]
    );
};
