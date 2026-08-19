import React from "react";

import { DiagramEditToolbarState } from "#root/redux/projectDiagramFeatureSlice";
import app_store, { app_actions } from "#root/redux/store";
import { selectDiagramEditToolbarState } from "#root/selectors/projectDiagramFeatureSelectors";
import {
    getInstanceValuePayloadFromStore,
    resolveNextStateAction,
} from "#root/utils/diagram/diagramStoreUtil";

import { getRootStateFromStore } from "../root";

export const getDiagramEditToolbarStateFromStore = (
    instanceId: string
): DiagramEditToolbarState => {
    return selectDiagramEditToolbarState(getRootStateFromStore(), instanceId);
};

export const setDiagramEditToolbarState = (
    value: React.SetStateAction<DiagramEditToolbarState>,
    instanceId: string
) => {
    const currentValue = getDiagramEditToolbarStateFromStore(instanceId);
    const nextValue = resolveNextStateAction(value, currentValue);

    app_store.dispatch(
        app_actions.diagram.setEditToolbarState(
            getInstanceValuePayloadFromStore(nextValue, instanceId)
        )
    );
};
