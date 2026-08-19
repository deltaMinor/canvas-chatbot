import React from "react";

import { useDiagramInstanceId } from "#root/contexts/DiagramInstanceContext";
import {
    useDiagramSelectedEdgeIdList,
    useDiagramSelectedNodeIdList,
    useSetDiagramEditToolbarState,
} from "#root/hooks/diagram";
import { getSelectedNodesFromStore } from "#root/stores/projectDiagram/selection";

export const useDiagramEditToolbarStateEffect = () => {
    const instanceId = useDiagramInstanceId();
    const selectedEdgeIdList = useDiagramSelectedEdgeIdList();
    const selectedNodeIdList = useDiagramSelectedNodeIdList();
    const setEditToolbarState = useSetDiagramEditToolbarState();

    React.useEffect(() => {
        const { selectedNodes } = getSelectedNodesFromStore(instanceId);

        const nodeWithRefKey = selectedNodes.some(
            (node) => String(node?.data?.cardRefKey ?? "").trim() !== ""
        );
        const allowDelete = selectedNodes?.every((node) => node?.deletable);
        const generalAllowed = !nodeWithRefKey;

        if (selectedNodes.length >= 3) {
            setEditToolbarState({
                general: generalAllowed,
                delete: allowDelete,
                alignment: true,
                distribution: true,
                layering: true,
            });
        } else if (selectedNodes.length === 2) {
            setEditToolbarState({
                general: generalAllowed,
                delete: allowDelete,
                alignment: true,
                distribution: false,
                layering: true,
            });
        } else if (selectedNodes.length === 1) {
            setEditToolbarState({
                general: generalAllowed,
                delete: allowDelete,
                alignment: false,
                distribution: false,
                layering: true,
            });
        } else {
            setEditToolbarState({
                general: false,
                delete: false,
                alignment: false,
                distribution: false,
                layering: false,
            });
        }
    }, [instanceId, selectedEdgeIdList, selectedNodeIdList, setEditToolbarState]);
};

export default useDiagramEditToolbarStateEffect;
