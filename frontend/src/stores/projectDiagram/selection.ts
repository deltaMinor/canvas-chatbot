import React from "react";

import app_store, { app_actions } from "#root/redux/store";
import {
    selectDiagramOverlayEdges,
    selectDiagramOverlayNodes,
    selectSelectedEdgeIdList,
    selectSelectedNodeIdList,
} from "#root/selectors/projectDiagramFeatureSelectors";
import {
    getActiveEdges,
    getActiveNodes,
    getSelectedEdges,
    getSelectedNodes,
} from "#root/utils/diagram/diagramSelectionUtil";
import {
    getInstanceValuePayloadFromStore,
    resolveNextStateAction,
} from "#root/utils/diagram/diagramStoreUtil";

import { getRootStateFromStore } from "../root";

import { getDiagramDraftCanvasFromStore } from "./canvas";

export const getDiagramSelectedNodeIdListFromStore = (
    instanceId: string //
): string[] => {
    return selectSelectedNodeIdList(getRootStateFromStore(), instanceId);
};

export const getSelectedNodesFromStore = (instanceId: string) => {
    const state = getRootStateFromStore();
    const draftCanvas = getDiagramDraftCanvasFromStore(instanceId);

    return {
        selectedNodes: getSelectedNodes(
            draftCanvas?.nodes ?? [],
            selectSelectedNodeIdList(state, instanceId)
        ),
    };
};

export const setDiagramSelectedNodeIdList = (
    value: React.SetStateAction<string[]>, //
    instanceId: string
) => {
    const currentValue = getDiagramSelectedNodeIdListFromStore(instanceId);
    const nextValue = resolveNextStateAction(value, currentValue);

    app_store.dispatch(
        app_actions.diagram.setSelectedNodeIdList(
            getInstanceValuePayloadFromStore(nextValue, instanceId)
        )
    );
};

export const getDiagramSelectedEdgeIdListFromStore = (
    instanceId: string //
): string[] => {
    return selectSelectedEdgeIdList(getRootStateFromStore(), instanceId);
};

export const getSelectedEdgesFromStore = (instanceId: string) => {
    const state = getRootStateFromStore();
    const draftCanvas = getDiagramDraftCanvasFromStore(instanceId);

    return {
        selectedEdges: getSelectedEdges(
            draftCanvas?.edges ?? [],
            selectSelectedEdgeIdList(state, instanceId)
        ),
    };
};

export const getActiveNodesFromStore = (instanceId: string) => {
    const state = getRootStateFromStore();
    const draftCanvas = getDiagramDraftCanvasFromStore(instanceId);

    return getActiveNodes(draftCanvas?.nodes ?? [], selectDiagramOverlayNodes(state, instanceId));
};

export const getActiveEdgesFromStore = (instanceId: string) => {
    const state = getRootStateFromStore();
    const draftCanvas = getDiagramDraftCanvasFromStore(instanceId);

    return getActiveEdges(draftCanvas?.edges ?? [], selectDiagramOverlayEdges(state, instanceId));
};

export const setDiagramSelectedEdgeIdList = (
    value: React.SetStateAction<string[]>, //
    instanceId: string
) => {
    const currentValue = getDiagramSelectedEdgeIdListFromStore(instanceId);
    const nextValue = resolveNextStateAction(value, currentValue);

    app_store.dispatch(
        app_actions.diagram.setSelectedEdgeIdList(
            getInstanceValuePayloadFromStore(nextValue, instanceId)
        )
    );
};
