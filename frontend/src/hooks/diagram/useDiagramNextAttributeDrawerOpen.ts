import React from "react";

import { useDiagramInstanceId } from "#root/contexts/DiagramInstanceContext";
import { getDiagramDrawerStateFromStore } from "#root/stores/projectDiagram/drawer";

import { useDiagramDrawerState } from "./projectDiagramFeatureHooks";

export const useDiagramNextAttributeDrawerOpen = () => {
    const drawerState = useDiagramDrawerState();

    return React.useMemo(() => !!drawerState?.node_info || !!drawerState?.edge_info, [drawerState]);
};

export const useDiagramNextAttributeDrawerOpenFromStore = () => {
    const instanceId = useDiagramInstanceId();
    const drawerState = getDiagramDrawerStateFromStore(instanceId);

    return React.useMemo(() => !!drawerState?.node_info || !!drawerState?.edge_info, [drawerState]);
};

export const getDiagramNextAttributeDrawerOpenFromStore = (instanceId: string) => {
    const drawerState = getDiagramDrawerStateFromStore(instanceId);

    return !!drawerState?.node_info || !!drawerState?.edge_info;
};

export default useDiagramNextAttributeDrawerOpen;
