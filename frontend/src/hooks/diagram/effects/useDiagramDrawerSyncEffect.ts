import React from "react";

import {
    useCloseAttributeDrawersOnCanvasChange,
    useDiagramDraftCanvasId,
    useDiagramDrawerState,
    useSyncAttributeDrawerOpen,
} from "#root/hooks/diagram";

export const useDiagramDrawerSyncEffect = () => {
    const draftCanvasId = useDiagramDraftCanvasId();
    const drawerState = useDiagramDrawerState();
    const syncAttributeDrawerOpen = useSyncAttributeDrawerOpen();
    const closeAttributeDrawersOnCanvasChange = useCloseAttributeDrawersOnCanvasChange();

    React.useEffect(() => {
        syncAttributeDrawerOpen();
    }, [drawerState?.edge_info, drawerState?.node_info, syncAttributeDrawerOpen]);

    React.useEffect(() => {
        closeAttributeDrawersOnCanvasChange();
    }, [closeAttributeDrawersOnCanvasChange, draftCanvasId]);
};
