import React from "react";

import { useDiagramDraftEdge, useDiagramDrawerState } from "../projectDiagramFeatureHooks";
import { useFocusDiagramEdge } from "../useDiagramNavigation";

export const useDiagramEdgeDrawerFocusEffect = () => {
    const drawerState = useDiagramDrawerState();
    const draftEdge = useDiagramDraftEdge();
    const focusDiagramEdge = useFocusDiagramEdge();

    React.useEffect(() => {
        if (!drawerState?.edge_info || !draftEdge?.id) return;
        focusDiagramEdge(draftEdge.id);
    }, [draftEdge?.id, drawerState?.edge_info, focusDiagramEdge]);
};
