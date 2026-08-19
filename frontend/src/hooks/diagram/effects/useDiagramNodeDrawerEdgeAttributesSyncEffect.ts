import React from "react";

import { useDiagramInstanceId } from "#root/contexts/DiagramInstanceContext";
import { getSelectedNodesFromStore } from "#root/stores/projectDiagram/selection";

import {
    useDiagramDrawerState,
    useDiagramSelectedNodeIdList,
    useSetDiagramDraftNode,
    useSetDiagramDraftNodeLabel,
    useSetDiagramDraftNodeLoaded,
} from "../projectDiagramFeatureHooks";
import { useReloadNodeAttributes, useResetNodeAttributes } from "../useDrawerNodeActions";

interface UseDiagramNodeDrawerEdgeAttributesSyncEffectProps {
    isOpen?: boolean;
}

export const useDiagramNodeDrawerEdgeAttributesSyncEffect = ({
    isOpen,
}: UseDiagramNodeDrawerEdgeAttributesSyncEffectProps = {}) => {
    const instanceId = useDiagramInstanceId();
    const drawerState = useDiagramDrawerState();
    const selectedNodeIdList = useDiagramSelectedNodeIdList();
    const setDraftNode = useSetDiagramDraftNode();
    const setDraftNodeLabel = useSetDiagramDraftNodeLabel();
    const setDraftNodeLoaded = useSetDiagramDraftNodeLoaded();
    const reloadNodeAttributes = useReloadNodeAttributes();
    const resetNodeAttributes = useResetNodeAttributes();
    const previousIsOpenRef = React.useRef(false);
    const previousSelectedNodeIdRef = React.useRef<string | null>(null);
    const effectiveIsOpen = isOpen ?? !!drawerState.node_info;

    React.useEffect(() => {
        let cancelled = false;
        const selectedNode = getSelectedNodesFromStore(instanceId).selectedNodes[0];

        if (!effectiveIsOpen) {
            // Closing the drawer should clear the draft state and reset the form state.
            setDraftNode(null);
            setDraftNodeLabel("");
            resetNodeAttributes();
            setDraftNodeLoaded(false);
            previousIsOpenRef.current = false;
            previousSelectedNodeIdRef.current = null;
            return;
        }

        if (!selectedNode?.id) {
            // Keep the drawer in its loading state until a selected node is available.
            setDraftNodeLoaded(false);
            return;
        }

        const shouldInitializeDraftNode =
            !previousIsOpenRef.current || previousSelectedNodeIdRef.current !== selectedNode.id;

        previousIsOpenRef.current = true;
        previousSelectedNodeIdRef.current = selectedNode.id;

        if (!shouldInitializeDraftNode) {
            return;
        }

        // Mark the drawer as loading, mirror the selected node into draft state,
        // then hydrate the editable attribute view from that draft node.
        setDraftNodeLoaded(false);
        setDraftNode(selectedNode);
        setDraftNodeLabel(selectedNode.data?.label ?? "");
        void (async () => {
            await reloadNodeAttributes(selectedNode);
            if (!cancelled) {
                setDraftNodeLoaded(true);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [
        drawerState.node_info,
        effectiveIsOpen,
        instanceId,
        reloadNodeAttributes,
        resetNodeAttributes,
        selectedNodeIdList,
        setDraftNode,
        setDraftNodeLabel,
        setDraftNodeLoaded,
    ]);
};
