import { PayloadAction, createSlice } from "@reduxjs/toolkit";

import type { TableRowParams } from "#root/interfaces/questionnaire";
import type { TableFieldFeatureState, TableFieldInstanceState } from "#root/interfaces/redux";
import type {
    InitializeTableFieldInstancePayload,
    TableFieldInstancePayload,
    UpdateTableFieldExternalStatePayload,
} from "#root/interfaces/reduxPayload";

export type {
    TableFieldExternalState,
    TableFieldFeatureState,
    TableFieldInstanceState,
} from "#root/interfaces/redux";

export const createInitialTableFieldInstanceState = (): TableFieldInstanceState => ({
    editTable: false,
    extendedFieldConfig: {},
    formValues: {},
    fieldConfig: undefined,
    immutableFieldIdList: [],
    isFieldDisabled: false,
    isFieldTracked: false,
    loaded: false,
    question: undefined,
    rows: [],
    savedRows: [],
    selectedTemplateIdList: [],
    tableType: "",
    uniqueFieldIdList: [],
});

const initialState: TableFieldFeatureState = {
    instances: {},
};

const getExistingInstanceId = (instanceId?: string) => {
    if (instanceId) {
        return instanceId;
    }

    return "default";
};

const ensureTableFieldInstance = (state: TableFieldFeatureState, instanceId?: string) => {
    const resolvedInstanceId = getExistingInstanceId(instanceId);

    if (!state.instances[resolvedInstanceId]) {
        state.instances[resolvedInstanceId] = createInitialTableFieldInstanceState();
    }

    return state.instances[resolvedInstanceId];
};

const getTableFieldPayload = <T>(
    payload: T | TableFieldInstancePayload<T>
): TableFieldInstancePayload<T> => {
    if (typeof payload === "object" && payload !== null && "value" in payload) {
        return payload as TableFieldInstancePayload<T>;
    }

    return {
        value: payload as T,
    };
};

const tableFieldSlice = createSlice({
    name: "tableFieldFeature",
    initialState,
    reducers: {
        initializeInstance(state, action: PayloadAction<InitializeTableFieldInstancePayload>) {
            if (!state.instances[action.payload.instanceId]) {
                state.instances[action.payload.instanceId] = {
                    ...createInitialTableFieldInstanceState(),
                    ...action.payload.externalState,
                };
            }
        },
        updateExternalState(state, action: PayloadAction<UpdateTableFieldExternalStatePayload>) {
            const instanceState = ensureTableFieldInstance(state, action.payload.instanceId);

            Object.assign(instanceState, action.payload.externalState);
        },
        removeInstance(state, action: PayloadAction<string>) {
            delete state.instances[action.payload];
        },
        setEditTable(state, action: PayloadAction<boolean | TableFieldInstancePayload<boolean>>) {
            const { instanceId, value } = getTableFieldPayload(action.payload);
            ensureTableFieldInstance(state, instanceId).editTable = value;
        },
        setRows(
            state,
            action: PayloadAction<TableRowParams[] | TableFieldInstancePayload<TableRowParams[]>>
        ) {
            const { instanceId, value } = getTableFieldPayload(action.payload);
            ensureTableFieldInstance(state, instanceId).rows = value;
        },
        setSavedRows(
            state,
            action: PayloadAction<TableRowParams[] | TableFieldInstancePayload<TableRowParams[]>>
        ) {
            const { instanceId, value } = getTableFieldPayload(action.payload);
            ensureTableFieldInstance(state, instanceId).savedRows = value;
        },
        setSelectedTemplateIdList(
            state,
            action: PayloadAction<string[] | TableFieldInstancePayload<string[]>>
        ) {
            const { instanceId, value } = getTableFieldPayload(action.payload);
            ensureTableFieldInstance(state, instanceId).selectedTemplateIdList = value;
        },
        setLoaded(state, action: PayloadAction<boolean | TableFieldInstancePayload<boolean>>) {
            const { instanceId, value } = getTableFieldPayload(action.payload);
            ensureTableFieldInstance(state, instanceId).loaded = value;
        },
    },
});

export const {
    initializeInstance,
    updateExternalState,
    removeInstance,
    setEditTable,
    setRows,
    setSavedRows,
    setSelectedTemplateIdList,
    setLoaded,
} = tableFieldSlice.actions;

export default tableFieldSlice.reducer;
