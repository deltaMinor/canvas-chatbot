import { PayloadAction, createSlice } from "@reduxjs/toolkit";

import { AuditLog } from "#root/interfaces";
import type { LogDialogFeatureState, LogDialogInstanceState } from "#root/interfaces/redux";
import type {
    InitializeLogDialogInstancePayload,
    LogDialogInstancePayload,
} from "#root/interfaces/reduxPayload";

export type { LogDialogFeatureState, LogDialogInstanceState } from "#root/interfaces/redux";

export const createInitialLogDialogInstanceState = (): LogDialogInstanceState => ({
    logs: [],
    detailsDialogOpen: false,
    excludedKeys: [],
    loaded: false,
    selectedAuditLogId: null,
});

const initialState: LogDialogFeatureState = {
    instances: {},
};

const getExistingInstanceId = (instanceId?: string) => {
    if (instanceId) {
        return instanceId;
    }

    return "default";
};

const ensureLogDialogInstance = (state: LogDialogFeatureState, instanceId?: string) => {
    const resolvedInstanceId = getExistingInstanceId(instanceId);

    if (!state.instances[resolvedInstanceId]) {
        state.instances[resolvedInstanceId] = createInitialLogDialogInstanceState();
    }

    return state.instances[resolvedInstanceId];
};

const getLogDialogPayload = <T>(
    payload: T | LogDialogInstancePayload<T>
): LogDialogInstancePayload<T> => {
    if (typeof payload === "object" && payload !== null && "value" in payload) {
        return payload as LogDialogInstancePayload<T>;
    }

    return {
        value: payload as T,
    };
};

const logDialogFeatureSlice = createSlice({
    name: "logDialogFeature",
    initialState,
    reducers: {
        initializeInstance(
            state, //
            action: PayloadAction<InitializeLogDialogInstancePayload>
        ) {
            const existingInstanceState = state.instances[action.payload.instanceId];

            if (!existingInstanceState) {
                state.instances[action.payload.instanceId] = {
                    ...createInitialLogDialogInstanceState(),
                    ...action.payload.initialState,
                };
                return;
            }

            Object.assign(existingInstanceState, {
                ...action.payload.initialState,
                ...existingInstanceState,
            });
        },
        removeInstance(
            state, //
            action: PayloadAction<string>
        ) {
            delete state.instances[action.payload];
        },
        setLogs(
            state, //

            action: PayloadAction<AuditLog[] | LogDialogInstancePayload<AuditLog[]>>
        ) {
            const { instanceId, value } = getLogDialogPayload(action.payload);
            ensureLogDialogInstance(
                state, //
                instanceId
            ).logs = value;
        },
        setLoaded(
            state, //
            action: PayloadAction<boolean | LogDialogInstancePayload<boolean>>
        ) {
            const { instanceId, value } = getLogDialogPayload(action.payload);
            ensureLogDialogInstance(
                state, //
                instanceId
            ).loaded = value;
        },
        setDetailsDialogOpen(
            state, //

            action: PayloadAction<boolean | LogDialogInstancePayload<boolean>>
        ) {
            const { instanceId, value } = getLogDialogPayload(action.payload);
            ensureLogDialogInstance(
                state, //
                instanceId
            ).detailsDialogOpen = value;
        },
        setExcludedKeys(
            state, //
            action: PayloadAction<string[] | LogDialogInstancePayload<string[]>>
        ) {
            const { instanceId, value } = getLogDialogPayload(action.payload);
            ensureLogDialogInstance(
                state, //
                instanceId
            ).excludedKeys = value;
        },
        setSelectedAuditLogId(
            state, //

            action: PayloadAction<string | null | LogDialogInstancePayload<string | null>>
        ) {
            const { instanceId, value } = getLogDialogPayload(action.payload);
            ensureLogDialogInstance(
                state, //
                instanceId
            ).selectedAuditLogId = value;
        },
    },
});

export const {
    initializeInstance,
    removeInstance,
    setLogs,
    setLoaded,
    setDetailsDialogOpen,
    setExcludedKeys,
    setSelectedAuditLogId,
} = logDialogFeatureSlice.actions;

export default logDialogFeatureSlice.reducer;
