import React from "react";

import app_store, { app_actions } from "#root/redux/store";
import {
    selectDiagramSetupNaturalLanguageDescription,
    selectDiagramSetupPendingSelectedOption,
    selectDiagramSetupSelectedOption,
    selectDiagramSetupSelectedTemplateCanvasId,
} from "#root/selectors/projectDiagramFeatureSelectors";
import {
    getInstanceValuePayloadFromStore,
    resolveNextStateAction,
} from "#root/utils/diagram/diagramStoreUtil";

import { getRootStateFromStore } from "../root";

export const getDiagramSetupSelectedOptionFromStore = (instanceId: string): string => {
    return selectDiagramSetupSelectedOption(getRootStateFromStore(), instanceId);
};

export const setDiagramSetupSelectedOption = (
    value: React.SetStateAction<string>,
    instanceId: string
) => {
    const currentValue = getDiagramSetupSelectedOptionFromStore(instanceId);
    const nextValue = resolveNextStateAction(value, currentValue);

    app_store.dispatch(
        app_actions.diagram.setSetupSelectedOption(
            getInstanceValuePayloadFromStore(nextValue, instanceId)
        )
    );
};

export const getDiagramSetupPendingSelectedOptionFromStore = (instanceId: string): string => {
    return selectDiagramSetupPendingSelectedOption(getRootStateFromStore(), instanceId);
};

export const setDiagramSetupPendingSelectedOption = (
    value: React.SetStateAction<string>,
    instanceId: string
) => {
    const currentValue = getDiagramSetupPendingSelectedOptionFromStore(instanceId);
    const nextValue = resolveNextStateAction(value, currentValue);

    app_store.dispatch(
        app_actions.diagram.setSetupPendingSelectedOption(
            getInstanceValuePayloadFromStore(nextValue, instanceId)
        )
    );
};

export const getDiagramSetupSelectedTemplateCanvasIdFromStore = (instanceId: string): string => {
    return selectDiagramSetupSelectedTemplateCanvasId(getRootStateFromStore(), instanceId);
};

export const setDiagramSetupSelectedTemplateCanvasId = (
    value: React.SetStateAction<string>,
    instanceId: string
) => {
    const currentValue = getDiagramSetupSelectedTemplateCanvasIdFromStore(instanceId);
    const nextValue = resolveNextStateAction(value, currentValue);

    app_store.dispatch(
        app_actions.diagram.setSetupSelectedTemplateCanvasId(
            getInstanceValuePayloadFromStore(nextValue, instanceId)
        )
    );
};

export const getDiagramSetupNaturalLanguageDescriptionFromStore = (instanceId: string): string => {
    return selectDiagramSetupNaturalLanguageDescription(getRootStateFromStore(), instanceId);
};

export const setDiagramSetupNaturalLanguageDescription = (
    value: React.SetStateAction<string>,
    instanceId: string
) => {
    const currentValue = getDiagramSetupNaturalLanguageDescriptionFromStore(instanceId);
    const nextValue = resolveNextStateAction(value, currentValue);

    app_store.dispatch(
        app_actions.diagram.setSetupNaturalLanguageDescription(
            getInstanceValuePayloadFromStore(nextValue, instanceId)
        )
    );
};
