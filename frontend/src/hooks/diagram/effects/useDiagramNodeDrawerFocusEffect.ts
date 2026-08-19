import React from "react";

import { useDiagramDraftNode, useDiagramDrawerState } from "../projectDiagramFeatureHooks";
import { useFocusDiagramNode } from "../useDiagramNavigation";

export const useDiagramNodeDrawerFocusEffect = () => {
    const drawerState = useDiagramDrawerState();
    const draftNode = useDiagramDraftNode();
    const focusDiagramNode = useFocusDiagramNode();
    const draftNodeId = draftNode?.id ?? "";

    React.useEffect(() => {
        if (!drawerState?.node_info || !draftNodeId) return;
        focusDiagramNode(draftNodeId);
    }, [draftNodeId, drawerState?.node_info, focusDiagramNode]);
};
