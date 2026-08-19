import React from "react";

import { OptionLabel } from "#root/interfaces";
import { DiagramEdge, DiagramNode, ResourceDrawerViewMode } from "#root/interfaces/diagram";
import { DiagramElementAttributes } from "#root/interfaces/diagramAttributes";
import { DiagramInstanceState } from "#root/redux/projectDiagramFeatureSlice";
import app_store, { app_actions } from "#root/redux/store";
import {
    selectDiagramDraftEdge,
    selectDiagramDraftEdgeAttributes,
    selectDiagramDraftEdgeLabel,
    selectDiagramDraftEdgeLoaded,
    selectDiagramDraftNode,
    selectDiagramDraftNodeAttributes,
    selectDiagramDraftNodeLabel,
    selectDiagramDraftNodeLoaded,
    selectDrawerState,
    selectIsAttributeDrawerOpen,
    selectIsEdgeDrawerDirty,
    selectIsNodeDrawerDirty,
    selectResourceDrawerSearchStrings,
    selectResourceDrawerSelected,
    selectResourceDrawerViewMode,
    selectViewEdgeDetails,
    selectViewNodeDetails,
} from "#root/selectors/projectDiagramFeatureSelectors";
import {
    getInstanceValuePayloadFromStore,
    resolveNextStateAction,
} from "#root/utils/diagram/diagramStoreUtil";

import { getRootStateFromStore } from "../root";

export const getDiagramViewNodeDetailsFromStore = (
    instanceId: string //
): boolean => {
    return selectViewNodeDetails(getRootStateFromStore(), instanceId);
};

export const setDiagramViewNodeDetails = (
    value: React.SetStateAction<boolean>, //
    instanceId: string
) => {
    const currentValue = getDiagramViewNodeDetailsFromStore(instanceId);
    const nextValue = resolveNextStateAction(value, currentValue);

    app_store.dispatch(
        app_actions.diagram.setViewNodeDetails(
            getInstanceValuePayloadFromStore(nextValue, instanceId)
        )
    );
};

export const getDiagramViewEdgeDetailsFromStore = (instanceId: string): boolean => {
    return selectViewEdgeDetails(getRootStateFromStore(), instanceId);
};

export const setDiagramViewEdgeDetails = (
    value: React.SetStateAction<boolean>, //
    instanceId: string
) => {
    const currentValue = getDiagramViewEdgeDetailsFromStore(instanceId);
    const nextValue = resolveNextStateAction(value, currentValue);

    app_store.dispatch(
        app_actions.diagram.setViewEdgeDetails(
            getInstanceValuePayloadFromStore(nextValue, instanceId)
        )
    );
};

export const getDiagramDrawerStateFromStore = (
    instanceId: string //
) => {
    return selectDrawerState(getRootStateFromStore(), instanceId);
};

export const setDiagramDrawerState = (
    value: React.SetStateAction<DiagramInstanceState["drawerState"]>, //
    instanceId: string
) => {
    const currentValue = getDiagramDrawerStateFromStore(instanceId);
    const nextValue = resolveNextStateAction(value, currentValue);

    app_store.dispatch(
        app_actions.diagram.setDrawerState(getInstanceValuePayloadFromStore(nextValue, instanceId))
    );
};

export const closeAllDiagramDrawers = (
    instanceId: string //
) => {
    const currentValue = getDiagramDrawerStateFromStore(instanceId);

    setDiagramDrawerState(
        {
            ...currentValue,
            diagram_resource: false,
            diagram_user_story: false,
            edge_info: false,
            layout: false,
            node: false,
            node_info: false,
            diagram_threat_scenario: false,
            diagram_threat_scenario_nodes: false,
            diagram_threat_scenario_edges: false,
        },
        instanceId
    );
};

export const getDiagramResourceDrawerSelectedFromStore = (
    instanceId: string //
): OptionLabel => {
    return selectResourceDrawerSelected(getRootStateFromStore(), instanceId);
};

export const setDiagramResourceDrawerSelected = (
    value: React.SetStateAction<OptionLabel>, //
    instanceId: string
) => {
    const currentValue = getDiagramResourceDrawerSelectedFromStore(instanceId);
    const nextValue = resolveNextStateAction(value, currentValue);

    app_store.dispatch(
        app_actions.diagram.setResourceDrawerSelected(
            getInstanceValuePayloadFromStore(nextValue, instanceId)
        )
    );
};

export const getDiagramResourceDrawerSearchStringsFromStore = (instanceId: string): string[] => {
    return selectResourceDrawerSearchStrings(getRootStateFromStore(), instanceId);
};

export const setDiagramResourceDrawerSearchStrings = (
    value: React.SetStateAction<string[]>,
    instanceId: string
) => {
    const currentValue = getDiagramResourceDrawerSearchStringsFromStore(instanceId);
    const nextValue = resolveNextStateAction(value, currentValue);

    app_store.dispatch(
        app_actions.diagram.setResourceDrawerSearchStrings(
            getInstanceValuePayloadFromStore(nextValue, instanceId)
        )
    );
};

export const getDiagramResourceDrawerViewModeFromStore = (
    instanceId: string
): ResourceDrawerViewMode => {
    return selectResourceDrawerViewMode(getRootStateFromStore(), instanceId);
};

export const setDiagramResourceDrawerViewMode = (
    value: React.SetStateAction<ResourceDrawerViewMode>,
    instanceId: string
) => {
    const currentValue = getDiagramResourceDrawerViewModeFromStore(instanceId);
    const nextValue = resolveNextStateAction(value, currentValue);

    app_store.dispatch(
        app_actions.diagram.setResourceDrawerViewMode(
            getInstanceValuePayloadFromStore(nextValue, instanceId)
        )
    );
};

export const getDiagramIsAttributeDrawerOpenFromStore = (
    instanceId: string //
): boolean => {
    return selectIsAttributeDrawerOpen(getRootStateFromStore(), instanceId);
};

export const setDiagramIsAttributeDrawerOpen = (
    value: React.SetStateAction<boolean>, //
    instanceId: string
) => {
    const currentValue = getDiagramIsAttributeDrawerOpenFromStore(instanceId);
    const nextValue = resolveNextStateAction(value, currentValue);

    app_store.dispatch(
        app_actions.diagram.setIsAttributeDrawerOpen(
            getInstanceValuePayloadFromStore(nextValue, instanceId)
        )
    );
};

export const getDiagramDraftNodeFromStore = (instanceId: string): DiagramNode | null => {
    return selectDiagramDraftNode(getRootStateFromStore(), instanceId);
};

export const setDiagramDraftNode = (
    value: React.SetStateAction<DiagramNode | null>,
    instanceId: string
) => {
    const currentValue = getDiagramDraftNodeFromStore(instanceId);
    const nextValue = resolveNextStateAction(value, currentValue);

    app_store.dispatch(
        app_actions.diagram.setDraftNode(getInstanceValuePayloadFromStore(nextValue, instanceId))
    );
};

export const getDiagramDraftEdgeFromStore = (instanceId: string): DiagramEdge | null => {
    return selectDiagramDraftEdge(getRootStateFromStore(), instanceId);
};

export const setDiagramDraftEdge = (
    value: React.SetStateAction<DiagramEdge | null>,
    instanceId: string
) => {
    const currentValue = getDiagramDraftEdgeFromStore(instanceId);
    const nextValue = resolveNextStateAction(value, currentValue);

    app_store.dispatch(
        app_actions.diagram.setDraftEdge(getInstanceValuePayloadFromStore(nextValue, instanceId))
    );
};

export const getDiagramDraftNodeLabelFromStore = (instanceId: string): string => {
    return selectDiagramDraftNodeLabel(getRootStateFromStore(), instanceId);
};

export const setDiagramDraftNodeLabel = (
    value: React.SetStateAction<string>,
    instanceId: string
) => {
    const currentValue = getDiagramDraftNodeLabelFromStore(instanceId);
    const nextValue = resolveNextStateAction(value, currentValue);

    app_store.dispatch(
        app_actions.diagram.setDraftNodeLabel(
            getInstanceValuePayloadFromStore(nextValue, instanceId)
        )
    );
};

export const getDiagramDraftEdgeLabelFromStore = (instanceId: string): string => {
    return selectDiagramDraftEdgeLabel(getRootStateFromStore(), instanceId);
};

export const setDiagramDraftEdgeLabel = (
    value: React.SetStateAction<string>,
    instanceId: string
) => {
    const currentValue = getDiagramDraftEdgeLabelFromStore(instanceId);
    const nextValue = resolveNextStateAction(value, currentValue);

    app_store.dispatch(
        app_actions.diagram.setDraftEdgeLabel(
            getInstanceValuePayloadFromStore(nextValue, instanceId)
        )
    );
};

export const getDiagramDraftNodeLoadedFromStore = (instanceId: string): boolean => {
    return selectDiagramDraftNodeLoaded(getRootStateFromStore(), instanceId);
};

export const setDiagramDraftNodeLoaded = (
    value: React.SetStateAction<boolean>,
    instanceId: string
) => {
    const currentValue = getDiagramDraftNodeLoadedFromStore(instanceId);
    const nextValue = resolveNextStateAction(value, currentValue);

    app_store.dispatch(
        app_actions.diagram.setDraftNodeLoaded(
            getInstanceValuePayloadFromStore(nextValue, instanceId)
        )
    );
};

export const getDiagramDraftEdgeLoadedFromStore = (instanceId: string): boolean => {
    return selectDiagramDraftEdgeLoaded(getRootStateFromStore(), instanceId);
};

export const setDiagramDraftEdgeLoaded = (
    value: React.SetStateAction<boolean>,
    instanceId: string
) => {
    const currentValue = getDiagramDraftEdgeLoadedFromStore(instanceId);
    const nextValue = resolveNextStateAction(value, currentValue);

    app_store.dispatch(
        app_actions.diagram.setDraftEdgeLoaded(
            getInstanceValuePayloadFromStore(nextValue, instanceId)
        )
    );
};

export const getDiagramIsNodeDrawerDirtyFromStore = (instanceId: string): boolean => {
    return selectIsNodeDrawerDirty(getRootStateFromStore(), instanceId);
};

export const setDiagramIsNodeDrawerDirty = (
    value: React.SetStateAction<boolean>,
    instanceId: string
) => {
    const currentValue = getDiagramIsNodeDrawerDirtyFromStore(instanceId);
    const nextValue = resolveNextStateAction(value, currentValue);

    app_store.dispatch(
        app_actions.diagram.setIsNodeDrawerDirty(
            getInstanceValuePayloadFromStore(nextValue, instanceId)
        )
    );
};

export const getDiagramIsEdgeDrawerDirtyFromStore = (instanceId: string): boolean => {
    return selectIsEdgeDrawerDirty(getRootStateFromStore(), instanceId);
};

export const setDiagramIsEdgeDrawerDirty = (
    value: React.SetStateAction<boolean>,
    instanceId: string
) => {
    const currentValue = getDiagramIsEdgeDrawerDirtyFromStore(instanceId);
    const nextValue = resolveNextStateAction(value, currentValue);

    app_store.dispatch(
        app_actions.diagram.setIsEdgeDrawerDirty(
            getInstanceValuePayloadFromStore(nextValue, instanceId)
        )
    );
};

export const getDiagramDraftNodeAttributesFromStore = (instanceId: string) => {
    return selectDiagramDraftNodeAttributes(getRootStateFromStore(), instanceId);
};

export const setDiagramDraftNodeAttributes = (
    value: React.SetStateAction<DiagramElementAttributes | null>,
    instanceId: string
) => {
    const currentValue = getDiagramDraftNodeAttributesFromStore(instanceId);
    const nextValue = resolveNextStateAction(value, currentValue);

    app_store.dispatch(
        app_actions.diagram.setDraftNodeAttributes(
            getInstanceValuePayloadFromStore(nextValue, instanceId)
        )
    );
};

export const getDiagramDraftEdgeAttributesFromStore = (instanceId: string) => {
    return selectDiagramDraftEdgeAttributes(getRootStateFromStore(), instanceId);
};

export const setDiagramDraftEdgeAttributes = (
    value: React.SetStateAction<DiagramElementAttributes | null>,
    instanceId: string
) => {
    const currentValue = getDiagramDraftEdgeAttributesFromStore(instanceId);
    const nextValue = resolveNextStateAction(value, currentValue);

    app_store.dispatch(
        app_actions.diagram.setDraftEdgeAttributes(
            getInstanceValuePayloadFromStore(nextValue, instanceId)
        )
    );
};
