import React from "react";

import { AuditLog } from "#root/interfaces";
import app_store, { app_actions } from "#root/redux/store";
import {
    selectLogDialogDetailsDialogOpen,
    selectLogDialogExcludedKeys,
    selectLogDialogLoaded,
    selectLogDialogLogs,
    selectLogDialogSelectedAuditLogId,
} from "#root/selectors/logDialogFeatureSelectors";

import { getRootStateFromStore } from "./root";

const getInstanceValuePayloadFromStore = <T>(value: T, instanceId: string) => {
    return instanceId ? { instanceId, value } : { value };
};

const resolveNextStateAction = <T>(value: React.SetStateAction<T>, currentValue: T): T => {
    return typeof value === "function" ? (value as (previousValue: T) => T)(currentValue) : value;
};

export const initializeLogDialogInstance = (
    instanceId: string,
    initialState?: Parameters<
        typeof app_actions.logDialogFeature.initializeInstance
    >[0]["initialState"]
) => {
    app_store.dispatch(
        app_actions.logDialogFeature.initializeInstance(
            initialState ? { instanceId, initialState } : { instanceId }
        )
    );
};

export const removeLogDialogInstance = (instanceId: string) => {
    app_store.dispatch(app_actions.logDialogFeature.removeInstance(instanceId));
};

export const getLogDialogLoadedFromStore = (instanceId: string): boolean => {
    return selectLogDialogLoaded(getRootStateFromStore(), instanceId);
};

export const setLogDialogLoaded = (value: React.SetStateAction<boolean>, instanceId: string) => {
    const nextValue = resolveNextStateAction(value, getLogDialogLoadedFromStore(instanceId));
    app_store.dispatch(
        app_actions.logDialogFeature.setLoaded(
            getInstanceValuePayloadFromStore(nextValue, instanceId)
        )
    );
};

export const getLogDialogDetailsDialogOpenFromStore = (instanceId: string): boolean => {
    return selectLogDialogDetailsDialogOpen(getRootStateFromStore(), instanceId);
};

export const setLogDialogDetailsDialogOpen = (
    value: React.SetStateAction<boolean>,
    instanceId: string
) => {
    const nextValue = resolveNextStateAction(
        value,
        getLogDialogDetailsDialogOpenFromStore(instanceId)
    );
    app_store.dispatch(
        app_actions.logDialogFeature.setDetailsDialogOpen(
            getInstanceValuePayloadFromStore(nextValue, instanceId)
        )
    );
};

export const getLogDialogExcludedKeysFromStore = (instanceId: string): string[] => {
    return selectLogDialogExcludedKeys(getRootStateFromStore(), instanceId);
};

export const setLogDialogExcludedKeys = (
    value: React.SetStateAction<string[]>,
    instanceId: string
) => {
    const nextValue = resolveNextStateAction(value, getLogDialogExcludedKeysFromStore(instanceId));
    app_store.dispatch(
        app_actions.logDialogFeature.setExcludedKeys(
            getInstanceValuePayloadFromStore(nextValue, instanceId)
        )
    );
};

export const getLogDialogSelectedAuditLogIdFromStore = (instanceId: string): string | null => {
    return selectLogDialogSelectedAuditLogId(getRootStateFromStore(), instanceId);
};

export const setLogDialogSelectedAuditLogId = (
    value: React.SetStateAction<string | null>,
    instanceId: string
) => {
    const nextValue = resolveNextStateAction(
        value,
        getLogDialogSelectedAuditLogIdFromStore(instanceId)
    );
    app_store.dispatch(
        app_actions.logDialogFeature.setSelectedAuditLogId(
            getInstanceValuePayloadFromStore(nextValue, instanceId)
        )
    );
};

export const getLogDialogLogsFromStore = (instanceId: string): AuditLog[] => {
    return selectLogDialogLogs(getRootStateFromStore(), instanceId);
};

export const setLogDialogLogs = (value: React.SetStateAction<AuditLog[]>, instanceId: string) => {
    const nextValue = resolveNextStateAction(value, getLogDialogLogsFromStore(instanceId));
    app_store.dispatch(
        app_actions.logDialogFeature.setLogs(
            getInstanceValuePayloadFromStore(nextValue, instanceId)
        )
    );
};
