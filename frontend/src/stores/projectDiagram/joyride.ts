import React from "react";

import { CanvasType } from "#root/interfaces/diagram";
import { DiagramView } from "#root/redux/projectDiagramFeatureSlice";
import app_store, { app_actions } from "#root/redux/store";
import {
    selectDiagramView,
    selectJoyrideViewType,
} from "#root/selectors/projectDiagramFeatureSelectors";
import {
    getInstanceValuePayloadFromStore,
    resolveNextStateAction,
} from "#root/utils/diagram/diagramStoreUtil";

import { getRootStateFromStore } from "../root";

export const getDiagramViewFromStore = (_instanceId?: string): DiagramView => {
    return selectDiagramView(getRootStateFromStore());
};

export const setDiagramView = (value: React.SetStateAction<DiagramView>, _instanceId?: string) => {
    const currentValue = getDiagramViewFromStore();
    const nextValue = resolveNextStateAction(value, currentValue);

    app_store.dispatch(app_actions.diagram.setDiagramView(nextValue));
};

export const getDiagramJoyrideViewTypeFromStore = (instanceId: string): CanvasType => {
    return selectJoyrideViewType(getRootStateFromStore(), instanceId);
};

export const setDiagramJoyrideViewType = (
    value: React.SetStateAction<CanvasType>,
    instanceId: string
) => {
    const currentValue = getDiagramJoyrideViewTypeFromStore(instanceId);
    const nextValue = resolveNextStateAction(value, currentValue);

    app_store.dispatch(
        app_actions.diagram.setJoyrideViewType(
            getInstanceValuePayloadFromStore(nextValue, instanceId)
        )
    );
};
