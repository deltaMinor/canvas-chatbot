import React from "react";

import { useStoreApi } from "@xyflow/react";

import { useDiagramInstanceId } from "#root/contexts/DiagramInstanceContext";
import { setDiagramSelectedEdgeIdList, setDiagramSelectedNodeIdList } from "#root/stores/projectDiagram/selection";

// Note: manual multi-select of nodes/edges (used by the old edit toolbar
// and attribute drawers) has been removed. This hook is kept because
// deselecting is still needed as a defensive reset - e.g. when switching
// draft canvases, or after certain dialog confirmations - even though
// nothing in the UI can put a node/edge into a selected state anymore.
export const useDeselectAllNodesAndEdges = () => {
    const store = useStoreApi();
    const instanceId = useDiagramInstanceId();

    return React.useCallback(() => {
        store.getState().unselectNodesAndEdges();
        setDiagramSelectedNodeIdList([], instanceId);
        setDiagramSelectedEdgeIdList([], instanceId);
    }, [instanceId, store]);
};
