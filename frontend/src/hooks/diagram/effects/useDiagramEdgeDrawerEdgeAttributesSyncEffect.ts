import React from "react";

import { useDiagramInstanceId } from "#root/contexts/DiagramInstanceContext";
import {
    useDiagramDrawerState,
    useDiagramSelectedEdgeIdList,
    useReloadEdgeAttributes,
    useResetEdgeAttributes,
    useSetDiagramDraftEdge,
    useSetDiagramDraftEdgeLabel,
    useSetDiagramDraftEdgeLoaded,
} from "#root/hooks/diagram";
import { getSelectedEdgesFromStore } from "#root/stores/projectDiagram/selection";

interface UseDiagramEdgeDrawerEdgeAttributesSyncEffectProps {
    isOpen?: boolean;
}

export const useDiagramEdgeDrawerEdgeAttributesSyncEffect = ({
    isOpen,
}: UseDiagramEdgeDrawerEdgeAttributesSyncEffectProps = {}) => {
    const instanceId = useDiagramInstanceId();
    const drawerState = useDiagramDrawerState();
    const selectedEdgeIdList = useDiagramSelectedEdgeIdList();
    const setDraftEdge = useSetDiagramDraftEdge();
    const setDraftEdgeLabel = useSetDiagramDraftEdgeLabel();
    const setDraftEdgeLoaded = useSetDiagramDraftEdgeLoaded();
    const reloadEdgeAttributes = useReloadEdgeAttributes();
    const resetEdgeAttributes = useResetEdgeAttributes();
    const previousIsOpenRef = React.useRef(false);
    const previousSelectedEdgeIdRef = React.useRef<string | null>(null);
    const effectiveIsOpen = isOpen ?? !!drawerState.edge_info;

    React.useEffect(() => {
        let cancelled = false;
        const selectedEdge = getSelectedEdgesFromStore(instanceId).selectedEdges[0];

        if (!effectiveIsOpen) {
            // Closing the drawer should clear the draft state and reset the form state.
            setDraftEdge(null);
            setDraftEdgeLabel("");
            resetEdgeAttributes();
            setDraftEdgeLoaded(false);
            previousIsOpenRef.current = false;
            previousSelectedEdgeIdRef.current = null;
            return;
        }

        if (!selectedEdge?.id) {
            // Keep the drawer in its loading state until a selected edge is available.
            setDraftEdgeLoaded(false);
            return;
        }

        const shouldInitializeDraftEdge =
            !previousIsOpenRef.current || previousSelectedEdgeIdRef.current !== selectedEdge.id;

        previousIsOpenRef.current = true;
        previousSelectedEdgeIdRef.current = selectedEdge.id;

        if (!shouldInitializeDraftEdge) {
            return;
        }

        // Mark the drawer as loading, mirror the selected edge into draft state,
        // then hydrate the editable attribute view from that draft edge.
        setDraftEdgeLoaded(false);
        setDraftEdge(selectedEdge);
        setDraftEdgeLabel(selectedEdge.data?.label ?? "");
        void (async () => {
            await reloadEdgeAttributes(selectedEdge);
            if (!cancelled) {
                setDraftEdgeLoaded(true);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [
        drawerState.edge_info,
        effectiveIsOpen,
        instanceId,
        reloadEdgeAttributes,
        resetEdgeAttributes,
        selectedEdgeIdList,
        setDraftEdge,
        setDraftEdgeLabel,
        setDraftEdgeLoaded,
    ]);
};
