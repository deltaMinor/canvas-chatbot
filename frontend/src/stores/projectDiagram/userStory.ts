import React from "react";

import { OptionLabel } from "#root/interfaces";
import app_store, { app_actions } from "#root/redux/store";
import {
    selectDiagramUserStoryNodesPositionApplyToAll,
    selectDiagramUserStoryPendingSelectedDataNodesMapping,
} from "#root/selectors/projectDiagramFeatureSelectors";
import {
    getInstanceValuePayloadFromStore,
    resolveNextStateAction,
} from "#root/utils/diagram/diagramStoreUtil";

import { getRootStateFromStore } from "../root";

export const getDiagramUserStoryPendingSelectedDataNodesMappingFromStore = (
    instanceId: string
): Record<string, OptionLabel[]> => {
    return selectDiagramUserStoryPendingSelectedDataNodesMapping(
        getRootStateFromStore(),
        instanceId
    );
};

export const setDiagramUserStoryPendingSelectedDataNodesMapping = (
    value: React.SetStateAction<Record<string, OptionLabel[]>>,
    instanceId: string
) => {
    const currentValue = getDiagramUserStoryPendingSelectedDataNodesMappingFromStore(instanceId);
    const nextValue = resolveNextStateAction(value, currentValue);

    app_store.dispatch(
        app_actions.diagram.setUserStoryPendingSelectedDataNodesMapping(
            getInstanceValuePayloadFromStore(nextValue, instanceId)
        )
    );
};

export const getDiagramUserStoryNodesPositionApplyToAllFromStore = (
    instanceId: string
): boolean => {
    return selectDiagramUserStoryNodesPositionApplyToAll(getRootStateFromStore(), instanceId);
};

export const setDiagramUserStoryNodesPositionApplyToAll = (
    value: React.SetStateAction<boolean>,
    instanceId: string
) => {
    const currentValue = getDiagramUserStoryNodesPositionApplyToAllFromStore(instanceId);
    const nextValue = resolveNextStateAction(value, currentValue);

    app_store.dispatch(
        app_actions.diagram.setUserStoryNodesPositionApplyToAll(
            getInstanceValuePayloadFromStore(nextValue, instanceId)
        )
    );
};
