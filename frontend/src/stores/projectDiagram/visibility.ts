import React from "react";

import app_store, { app_actions } from "#root/redux/store";
import { selectHiddenEdgeIds } from "#root/selectors/projectDiagramFeatureSelectors";
import {
    getInstanceValuePayloadFromStore,
    resolveNextStateAction,
} from "#root/utils/diagram/diagramStoreUtil";

import { getRootStateFromStore } from "../root";

export const getDiagramHiddenEdgeIdsFromStore = (instanceId: string): string[] => {
    return selectHiddenEdgeIds(getRootStateFromStore(), instanceId);
};

export const setDiagramHiddenEdgeIds = (
    value: React.SetStateAction<string[]>,
    instanceId: string
) => {
    const currentValue = getDiagramHiddenEdgeIdsFromStore(instanceId);
    const nextValue = resolveNextStateAction(value, currentValue);

    app_store.dispatch(
        app_actions.diagram.setHiddenEdgeIds(
            getInstanceValuePayloadFromStore(nextValue, instanceId)
        )
    );
};
