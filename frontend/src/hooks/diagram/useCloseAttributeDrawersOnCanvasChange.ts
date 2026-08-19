import React from "react";

import { useDiagramInstanceId } from "#root/contexts/DiagramInstanceContext";
import { useSetDiagramDrawerState } from "#root/hooks/diagram";
import { getDraftCanvasIdFromStore } from "#root/stores/projectDiagram/backend";
import { getDiagramDrawerStateFromStore } from "#root/stores/projectDiagram/drawer";

export const useCloseAttributeDrawersOnCanvasChange = () => {
    const instanceId = useDiagramInstanceId();
    const setDiagramDrawerState = useSetDiagramDrawerState();
    const previousCanvasIdRef = React.useRef(getDraftCanvasIdFromStore(instanceId) ?? "");

    return React.useCallback(() => {
        const drawerState = getDiagramDrawerStateFromStore(instanceId);
        const nextCanvasId = getDraftCanvasIdFromStore(instanceId) ?? "";
        const didCanvasIdChange = previousCanvasIdRef.current !== nextCanvasId;
        previousCanvasIdRef.current = nextCanvasId;

        if (!didCanvasIdChange) {
            return;
        }

        if (!drawerState?.node_info && !drawerState?.edge_info) {
            return;
        }

        setDiagramDrawerState((prev) => ({
            ...prev,
            node_info: false,
            edge_info: false,
        }));
    }, [instanceId, setDiagramDrawerState]);
};

export default useCloseAttributeDrawersOnCanvasChange;
