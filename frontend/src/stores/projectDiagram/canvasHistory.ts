import React from "react";

import { DiagramCanvas } from "#root/interfaces/diagram";
import app_store, { app_actions } from "#root/redux/store";
import {
    selectDiagramCanvasHistory,
    selectDiagramCanvasHistoryIndex,
} from "#root/selectors/projectDiagramFeatureSelectors";
import {
    getInstanceValuePayloadFromStore,
    resolveNextStateAction,
} from "#root/utils/diagram/diagramStoreUtil";

import { getRootStateFromStore } from "../root";

export const getDiagramCanvasHistoryFromStore = (instanceId: string): DiagramCanvas[] => {
    return selectDiagramCanvasHistory(getRootStateFromStore(), instanceId);
};

export const setDiagramCanvasHistory = (
    value: React.SetStateAction<DiagramCanvas[]>,
    instanceId: string
) => {
    const currentValue = getDiagramCanvasHistoryFromStore(instanceId);
    const nextValue = resolveNextStateAction(value, currentValue);

    app_store.dispatch(
        app_actions.diagram.setCanvasHistory(
            getInstanceValuePayloadFromStore(nextValue, instanceId)
        )
    );
};

export const getDiagramCanvasHistoryIndexFromStore = (instanceId: string): number => {
    return selectDiagramCanvasHistoryIndex(getRootStateFromStore(), instanceId);
};

export const setDiagramCanvasHistoryIndex = (
    value: React.SetStateAction<number>,
    instanceId: string
) => {
    const currentValue = getDiagramCanvasHistoryIndexFromStore(instanceId);
    const nextValue = resolveNextStateAction(value, currentValue);

    app_store.dispatch(
        app_actions.diagram.setCanvasHistoryIndex(
            getInstanceValuePayloadFromStore(nextValue, instanceId)
        )
    );
};
