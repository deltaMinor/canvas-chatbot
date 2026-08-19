import React from "react";

import { HandleType } from "@xyflow/react";

import app_store, { app_actions } from "#root/redux/store";
import {
    selectDiagramIsConnecting,
    selectDiagramIsConnectingHandleType,
} from "#root/selectors/projectDiagramFeatureSelectors";
import {
    getInstanceValuePayloadFromStore,
    resolveNextStateAction,
} from "#root/utils/diagram/diagramStoreUtil";

import { getRootStateFromStore } from "../root";

export const getDiagramIsConnectingFromStore = (instanceId: string): boolean => {
    return selectDiagramIsConnecting(getRootStateFromStore(), instanceId);
};

export const setDiagramIsConnecting = (
    value: React.SetStateAction<boolean>,
    instanceId: string
) => {
    const currentValue = getDiagramIsConnectingFromStore(instanceId);
    const nextValue = resolveNextStateAction(value, currentValue);

    app_store.dispatch(
        app_actions.diagram.setIsConnecting(getInstanceValuePayloadFromStore(nextValue, instanceId))
    );
};

export const getDiagramIsConnectingHandleTypeFromStore = (instanceId: string): HandleType => {
    return selectDiagramIsConnectingHandleType(getRootStateFromStore(), instanceId);
};

export const setDiagramIsConnectingHandleType = (
    value: React.SetStateAction<HandleType>,
    instanceId: string
) => {
    const currentValue = getDiagramIsConnectingHandleTypeFromStore(instanceId);
    const nextValue = resolveNextStateAction(value, currentValue);

    app_store.dispatch(
        app_actions.diagram.setIsConnectingHandleType(
            getInstanceValuePayloadFromStore(nextValue, instanceId)
        )
    );
};
