import React from "react";

import { SortDirection, WarningMessage, WarningMessageMapping } from "#root/interfaces/diagram";
import app_store, { app_actions } from "#root/redux/store";
import {
    selectHiddenWarningIdList,
    selectWarningFilterKey,
    selectWarningList,
    selectWarningListMapping,
    selectWarningSortCriteria,
    selectWarningSortDirection,
} from "#root/selectors/projectDiagramFeatureSelectors";
import {
    getInstanceValuePayloadFromStore,
    resolveNextStateAction,
} from "#root/utils/diagram/diagramStoreUtil";

import { getRootStateFromStore } from "../root";

export const getDiagramWarningListMappingFromStore = (
    instanceId: string //
): WarningMessageMapping => {
    return selectWarningListMapping(getRootStateFromStore(), instanceId);
};

export const setDiagramWarningListMapping = (
    value: React.SetStateAction<WarningMessageMapping>, //
    instanceId: string
) => {
    const currentValue = getDiagramWarningListMappingFromStore(instanceId);
    const nextValue = resolveNextStateAction(value, currentValue);

    app_store.dispatch(
        app_actions.diagram.setWarningListMapping(
            getInstanceValuePayloadFromStore(nextValue, instanceId)
        )
    );
};

export const getDiagramWarningFilterKeyFromStore = (
    instanceId: string //
): string => {
    return selectWarningFilterKey(getRootStateFromStore(), instanceId);
};

export const setDiagramWarningFilterKey = (
    value: React.SetStateAction<string>, //
    instanceId: string
) => {
    const currentValue = getDiagramWarningFilterKeyFromStore(instanceId);
    const nextValue = resolveNextStateAction(value, currentValue);

    app_store.dispatch(
        app_actions.diagram.setWarningFilterKey(
            getInstanceValuePayloadFromStore(nextValue, instanceId)
        )
    );
};

export const getDiagramWarningSortDirectionFromStore = (
    instanceId: string //
): SortDirection => {
    return selectWarningSortDirection(getRootStateFromStore(), instanceId);
};

export const setDiagramWarningSortDirection = (
    value: React.SetStateAction<SortDirection>, //
    instanceId: string
) => {
    const currentValue = getDiagramWarningSortDirectionFromStore(instanceId);
    const nextValue = resolveNextStateAction(value, currentValue);

    app_store.dispatch(
        app_actions.diagram.setWarningSortDirection(
            getInstanceValuePayloadFromStore(nextValue, instanceId)
        )
    );
};

export const getDiagramWarningSortCriteriaFromStore = (
    instanceId: string //
): string => {
    return selectWarningSortCriteria(getRootStateFromStore(), instanceId);
};

export const setDiagramWarningSortCriteria = (
    value: React.SetStateAction<string>, //
    instanceId: string
) => {
    const currentValue = getDiagramWarningSortCriteriaFromStore(instanceId);
    const nextValue = resolveNextStateAction(value, currentValue);

    app_store.dispatch(
        app_actions.diagram.setWarningSortCriteria(
            getInstanceValuePayloadFromStore(nextValue, instanceId)
        )
    );
};

export const getDiagramHiddenWarningIdListFromStore = (
    instanceId: string //
): string[] => {
    return selectHiddenWarningIdList(getRootStateFromStore(), instanceId);
};

export const setDiagramHiddenWarningIdList = (
    value: React.SetStateAction<string[]>, //
    instanceId: string
) => {
    const currentValue = getDiagramHiddenWarningIdListFromStore(instanceId);
    const nextValue = resolveNextStateAction(value, currentValue);

    app_store.dispatch(
        app_actions.diagram.setHiddenWarningIdList(
            getInstanceValuePayloadFromStore(nextValue, instanceId)
        )
    );
};

export const getDiagramWarningListFromStore = (
    instanceId: string //
): WarningMessage[] => {
    return selectWarningList(getRootStateFromStore(), instanceId);
};

export const setDiagramWarningList = (
    value: React.SetStateAction<WarningMessage[]>, //
    instanceId: string
) => {
    const currentValue = getDiagramWarningListFromStore(instanceId);
    const nextValue = resolveNextStateAction(value, currentValue);

    app_store.dispatch(
        app_actions.diagram.setWarningList(getInstanceValuePayloadFromStore(nextValue, instanceId))
    );
};
