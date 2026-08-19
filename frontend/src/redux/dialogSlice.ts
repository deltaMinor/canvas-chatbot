import { createSlice } from "@reduxjs/toolkit";

import {
    initDialogConfirmState,
    initDialogFieldState,
    initDialogState,
    initLogDialogState,
} from "#root/interfaces/dialog";
import type { DialogReducer, DialogStatePayload, DialogStoreState } from "#root/interfaces/redux";

export type {
    DialogConfirmStateStore,
    DialogFieldStateStore,
    DialogReducer,
    DialogStateKey,
    DialogStatePayload,
    DialogStateStore,
    DialogStoreState,
    LogDialogStateStore,
} from "#root/interfaces/redux";

const getDialogStoreState = <T extends string>(groupState: Record<T, boolean>) => {
    const dialogStoreState = {} as Record<string, boolean>;
    for (const key in groupState) {
        dialogStoreState[key] = groupState[key];
    }
    return dialogStoreState;
};

const applyDialogState = (state: DialogStoreState, payload: DialogStatePayload) => {
    for (const key in payload) {
        const dialogKey = key as keyof DialogStatePayload;
        const value = payload[dialogKey];
        if (typeof value !== "boolean") {
            continue;
        }
        if (state[dialogKey as keyof DialogStoreState] !== value) {
            state[dialogKey as keyof DialogStoreState] = value as never;
        }
    }
};

const initialState: DialogStoreState = {
    ...getDialogStoreState(initDialogState),
    ...getDialogStoreState(initDialogConfirmState),
    ...getDialogStoreState(initDialogFieldState),
    ...getDialogStoreState(initLogDialogState),
} as unknown as DialogStoreState;

const reducers = {
    openDialog(state, action) {
        state[action.payload] = true;
    },
    closeDialog(state, action) {
        state[action.payload] = false;
    },
    setDialogState(state, action) {
        applyDialogState(state, action.payload);
    },
    closeAllDialogs(state) {
        applyDialogState(state, initialState);
    },
} satisfies DialogReducer;

const dialogSlice = createSlice({
    name: "dialog",
    initialState,
    reducers,
});

export { getDialogStoreState };

export default dialogSlice;
