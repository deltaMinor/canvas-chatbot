import type { LogDialogInstanceState } from "#root/interfaces/redux";
import { InstanceStateResolver } from "#root/lib/InstanceStateResolver";
import { createInitialLogDialogInstanceState } from "#root/redux/logDialogFeatureSlice";
import { RootState } from "#root/redux/store";

const selectLogDialogFeatureState = (state: RootState) => state.logDialogFeature.instances;

export const selectLogDialogInstanceState = (
    state: RootState,
    instanceId?: string
): LogDialogInstanceState => {
    return InstanceStateResolver.resolve({
        instances: selectLogDialogFeatureState(state),
        instanceId,
        createInitialState: createInitialLogDialogInstanceState,
    });
};

export const selectLogDialogLoaded = (state: RootState, instanceId?: string) => {
    return selectLogDialogInstanceState(state, instanceId).loaded;
};

export const selectLogDialogLogs = (state: RootState, instanceId?: string) => {
    return selectLogDialogInstanceState(state, instanceId).logs;
};

export const selectLogDialogDetailsDialogOpen = (state: RootState, instanceId?: string) => {
    return selectLogDialogInstanceState(state, instanceId).detailsDialogOpen;
};

export const selectLogDialogExcludedKeys = (state: RootState, instanceId?: string) => {
    return selectLogDialogInstanceState(state, instanceId).excludedKeys;
};

export const selectLogDialogSelectedAuditLogId = (state: RootState, instanceId?: string) => {
    return selectLogDialogInstanceState(state, instanceId).selectedAuditLogId;
};
