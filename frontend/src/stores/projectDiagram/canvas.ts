import React from "react";

import {
    DiagramCanvas,
    DiagramEdge,
    DiagramNode,
    NodeHandleEdgeMappingDict,
} from "#root/interfaces/diagram";
import app_store, { app_actions } from "#root/redux/store";
import {
    selectBackendSaveEnabled,
    selectBiDirectionalArrow,
    selectDiagramCanvasInit,
    selectDiagramDraftCanvasLlmGenerationStatus,
    selectDiagramDraftCanvasName,
    selectDiagramDraftCanvasRef,
    selectDiagramDraftCanvasType,
    selectDiagramDraftCanvasViewOnly,
    selectDiagramInstanceState,
    selectDiagramMiniMapExpanded,
    selectDiagramOverlayEdges,
    selectDiagramOverlayNodes,
    selectDiagramSelectedTabGroup,
    selectInTransition,
    selectNodeHandleEdgeMapping,
    selectPendingDrawerKey,
    selectRequestedThreatScenarioDrawerKey,
} from "#root/selectors/projectDiagramFeatureSelectors";
import { getSelectedCanvas } from "#root/utils/diagram/backendDiagramUtil";
import {
    getDiagramDraftCanvasEdges,
    getDiagramDraftCanvasNodes,
} from "#root/utils/diagram/diagramSelectionUtil";
import {
    getInstanceValuePayloadFromStore,
    resolveNextStateAction,
} from "#root/utils/diagram/diagramStoreUtil";

import { getRootStateFromStore } from "../root";

import { getBackendProjectDiagramFromStore, getDraftCanvasIdFromStore } from "./backend";

export const getDiagramDraftCanvasFromStore = (
    instanceId: string //
): DiagramCanvas | undefined => {
    const state = getRootStateFromStore();
    const diagramInstanceState = selectDiagramInstanceState(state, instanceId);

    return (
        diagramInstanceState.draftCanvas ??
        getSelectedCanvas({
            diagramInstances: state.diagram.instances,
            instanceId,
            projectDiagram: getBackendProjectDiagramFromStore(),
        })
    );
};

export const getDiagramDraftCanvasTypeFromStore = (
    instanceId: string
): DiagramCanvas["canvas_type"] | undefined => {
    return selectDiagramDraftCanvasType(getRootStateFromStore(), instanceId);
};

export const getDiagramDraftCanvasViewOnlyFromStore = (instanceId: string): boolean => {
    return !!selectDiagramDraftCanvasViewOnly(getRootStateFromStore(), instanceId);
};

export const getDiagramDraftCanvasRefFromStore = (
    instanceId: string
): DiagramCanvas["ref"] | undefined => {
    return selectDiagramDraftCanvasRef(getRootStateFromStore(), instanceId);
};

export const getDiagramDraftCanvasNameFromStore = (
    instanceId: string
): DiagramCanvas["canvas_name"] | undefined => {
    return selectDiagramDraftCanvasName(getRootStateFromStore(), instanceId);
};

export const getDiagramDraftCanvasLLMGenerationStatusFromStore = (
    instanceId: string
): DiagramCanvas["llm_generation_status"] | undefined => {
    return selectDiagramDraftCanvasLlmGenerationStatus(getRootStateFromStore(), instanceId);
};

export const getDiagramMiniMapExpandedFromStore = (instanceId: string): boolean => {
    return selectDiagramMiniMapExpanded(getRootStateFromStore(), instanceId);
};

export const getDiagramSelectedTabGroupFromStore = (instanceId: string): string => {
    return selectDiagramSelectedTabGroup(getRootStateFromStore(), instanceId);
};

export const setDiagramSelectedTabGroup = (
    value: React.SetStateAction<string>,
    instanceId: string
) => {
    const currentValue = getDiagramSelectedTabGroupFromStore(instanceId);
    const nextValue = resolveNextStateAction(value, currentValue);

    app_store.dispatch(
        app_actions.diagram.setSelectedTabGroup(
            getInstanceValuePayloadFromStore(nextValue, instanceId)
        )
    );
};

export const setDiagramMiniMapExpanded = (
    value: React.SetStateAction<boolean>,
    instanceId: string
) => {
    const currentValue = getDiagramMiniMapExpandedFromStore(instanceId);
    const nextValue = resolveNextStateAction(value, currentValue);

    app_store.dispatch(
        app_actions.diagram.setMiniMapExpanded(
            getInstanceValuePayloadFromStore(nextValue, instanceId)
        )
    );
};

export const setDiagramDraftCanvas = (
    value: React.SetStateAction<DiagramCanvas | undefined>, //
    instanceId: string
) => {
    const currentValue = getDiagramDraftCanvasFromStore(instanceId);
    const nextValue = resolveNextStateAction(value, currentValue);

    app_store.dispatch(
        app_actions.diagram.setDraftCanvas(getInstanceValuePayloadFromStore(nextValue, instanceId))
    );
};

export const setDiagramDraftCanvasId = (
    value: React.SetStateAction<string>, //
    instanceId: string
) => {
    const currentValue = getDraftCanvasIdFromStore(instanceId) ?? "";
    const nextValue = typeof value === "function" ? value(currentValue) : value;

    app_store.dispatch(
        app_actions.diagram.setDraftCanvasId(
            getInstanceValuePayloadFromStore(
                nextValue, //
                instanceId
            )
        )
    );
};

export const getDiagramBiDirectionalArrowFromStore = (
    instanceId: string //
): boolean => {
    return selectBiDirectionalArrow(getRootStateFromStore(), instanceId);
};

export const setDiagramBiDirectionalArrow = (
    value: React.SetStateAction<boolean>, //
    instanceId: string
) => {
    const currentValue = getDiagramBiDirectionalArrowFromStore(instanceId);
    const nextValue = resolveNextStateAction(value, currentValue);

    app_store.dispatch(
        app_actions.diagram.setBiDirectionalArrow(
            getInstanceValuePayloadFromStore(nextValue, instanceId)
        )
    );
};

export const getDiagramBackendSaveEnabledFromStore = (
    instanceId: string //
): boolean => {
    return selectBackendSaveEnabled(getRootStateFromStore(), instanceId);
};

export const setDiagramBackendSaveEnabled = (
    value: React.SetStateAction<boolean>, //
    instanceId: string
) => {
    const currentValue = getDiagramBackendSaveEnabledFromStore(instanceId);
    const nextValue = resolveNextStateAction(value, currentValue);

    app_store.dispatch(
        app_actions.diagram.setBackendSaveEnabled(
            getInstanceValuePayloadFromStore(nextValue, instanceId)
        )
    );
};

export const getDiagramInTransitionFromStore = (
    _instanceId?: string //
): boolean => {
    return selectInTransition(getRootStateFromStore());
};

export const setDiagramInTransition = (
    value: React.SetStateAction<boolean>, //
    _instanceId?: string
) => {
    const currentValue = getDiagramInTransitionFromStore();
    const nextValue = resolveNextStateAction(value, currentValue);

    app_store.dispatch(app_actions.diagram.setInTransition(nextValue));
};

export const getDiagramDraftCanvasEdgesFromStore = (
    instanceId: string //
): DiagramEdge[] => {
    return getDiagramDraftCanvasEdges(getDiagramDraftCanvasFromStore(instanceId));
};

export const setDiagramDraftCanvasEdges = (
    value: React.SetStateAction<DiagramEdge[]>, //
    instanceId: string
) => {
    const currentEdges = getDiagramDraftCanvasEdgesFromStore(instanceId);
    const nextValue = resolveNextStateAction(value, currentEdges);
    const currentDraftCanvas = getDiagramDraftCanvasFromStore(instanceId);

    if (!currentDraftCanvas) {
        return;
    }

    const instanceState = selectDiagramInstanceState(getRootStateFromStore(), instanceId);
    if (!instanceState.draftCanvas) {
        app_store.dispatch(
            app_actions.diagram.setDraftCanvas(
                getInstanceValuePayloadFromStore(
                    {
                        ...currentDraftCanvas,
                        edges: nextValue,
                    },
                    instanceId
                )
            )
        );
        return;
    }

    app_store.dispatch(
        app_actions.diagram.setEdges(getInstanceValuePayloadFromStore(nextValue, instanceId))
    );
};

export const getDiagramOverlayEdgesFromStore = (
    instanceId: string //
): DiagramEdge[] => {
    return selectDiagramOverlayEdges(getRootStateFromStore(), instanceId);
};

export const setDiagramOverlayEdges = (
    value: React.SetStateAction<DiagramEdge[]>, //
    instanceId: string
) => {
    const currentEdges = getDiagramOverlayEdgesFromStore(instanceId);
    const nextValue = resolveNextStateAction(value, currentEdges);

    app_store.dispatch(
        app_actions.diagram.setOverlayEdges(getInstanceValuePayloadFromStore(nextValue, instanceId))
    );
};

export const getDiagramDraftCanvasNodesFromStore = (
    instanceId: string //
): DiagramNode[] => {
    return getDiagramDraftCanvasNodes(getDiagramDraftCanvasFromStore(instanceId));
};

export const setDiagramDraftCanvasNodes = (
    value: React.SetStateAction<DiagramNode[]>, //
    instanceId: string
) => {
    const currentNodes = getDiagramDraftCanvasNodesFromStore(instanceId);
    const nextValue = resolveNextStateAction(value, currentNodes);
    const currentDraftCanvas = getDiagramDraftCanvasFromStore(instanceId);

    if (!currentDraftCanvas) {
        return;
    }

    const instanceState = selectDiagramInstanceState(getRootStateFromStore(), instanceId);
    if (!instanceState.draftCanvas) {
        app_store.dispatch(
            app_actions.diagram.setDraftCanvas(
                getInstanceValuePayloadFromStore(
                    {
                        ...currentDraftCanvas,
                        nodes: nextValue,
                    },
                    instanceId
                )
            )
        );
        return;
    }

    app_store.dispatch(
        app_actions.diagram.setNodes(getInstanceValuePayloadFromStore(nextValue, instanceId))
    );
};

export const getDiagramOverlayNodesFromStore = (
    instanceId: string //
): DiagramNode[] => {
    return selectDiagramOverlayNodes(getRootStateFromStore(), instanceId);
};

export const setDiagramOverlayNodes = (
    value: React.SetStateAction<DiagramNode[]>, //
    instanceId: string
) => {
    const currentNodes = getDiagramOverlayNodesFromStore(instanceId);
    const nextValue = resolveNextStateAction(value, currentNodes);

    app_store.dispatch(
        app_actions.diagram.setOverlayNodes(getInstanceValuePayloadFromStore(nextValue, instanceId))
    );
};

export const getDiagramNodeHandleEdgeMappingFromStore = (
    instanceId: string //
): NodeHandleEdgeMappingDict => {
    return selectNodeHandleEdgeMapping(getRootStateFromStore(), instanceId);
};

export const setDiagramNodeHandleEdgeMapping = (
    value: React.SetStateAction<NodeHandleEdgeMappingDict>, //
    instanceId: string
) => {
    const currentValue = getDiagramNodeHandleEdgeMappingFromStore(instanceId);
    const nextValue = resolveNextStateAction(value, currentValue);

    app_store.dispatch(
        app_actions.diagram.setNodeHandleEdgeMapping(
            getInstanceValuePayloadFromStore(nextValue, instanceId)
        )
    );
};

export const getDiagramCanvasInitFromStore = (
    instanceId: string //
): boolean => {
    return selectDiagramCanvasInit(getRootStateFromStore(), instanceId);
};

export const setDiagramCanvasInit = (
    value: React.SetStateAction<boolean>, //
    instanceId: string
) => {
    const currentCanvasInit = getDiagramCanvasInitFromStore(instanceId);
    const nextValue = resolveNextStateAction(value, currentCanvasInit);

    app_store.dispatch(
        app_actions.diagram.setCanvasInit(getInstanceValuePayloadFromStore(nextValue, instanceId))
    );
};

export const getDiagramPendingDrawerKeyFromStore = (
    instanceId: string //
): "attackPath" | "overview" | "nodes" | "edges" | null => {
    return selectPendingDrawerKey(getRootStateFromStore(), instanceId);
};

export const setDiagramPendingDrawerKey = (
    value: React.SetStateAction<"attackPath" | "overview" | "nodes" | "edges" | null>, //
    instanceId: string
) => {
    const currentValue = getDiagramPendingDrawerKeyFromStore(instanceId);
    const nextValue = resolveNextStateAction(value, currentValue);

    app_store.dispatch(
        app_actions.diagram.setPendingDrawerKey(
            getInstanceValuePayloadFromStore(nextValue, instanceId)
        )
    );
};

export const getDiagramRequestedThreatScenarioDrawerKeyFromStore = (
    instanceId: string
): "attackPath" | "overview" | "nodes" | "edges" | null => {
    return selectRequestedThreatScenarioDrawerKey(getRootStateFromStore(), instanceId);
};

export const setDiagramRequestedThreatScenarioDrawerKey = (
    value: React.SetStateAction<"attackPath" | "overview" | "nodes" | "edges" | null>,
    instanceId: string
) => {
    const currentValue = getDiagramRequestedThreatScenarioDrawerKeyFromStore(instanceId);
    const nextValue = resolveNextStateAction(value, currentValue);

    app_store.dispatch(
        app_actions.diagram.setRequestedThreatScenarioDrawerKey(
            getInstanceValuePayloadFromStore(nextValue, instanceId)
        )
    );
};
