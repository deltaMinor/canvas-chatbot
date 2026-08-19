import {
    GridColDef,
    GridColumnVisibilityModel,
    GridRowSelectionModel,
    GridValidRowModel,
} from "@mui/x-data-grid";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";

import { initRowSelectionModel } from "#root/constants/dataGrid";
import type { MuiDataGridFeatureState, MuiDataGridInstanceState } from "#root/interfaces/redux";
import type {
    MuiDataGridInstancePayload,
    UpdateMuiDataGridExternalStatePayload,
} from "#root/interfaces/reduxPayload";

export type { MuiDataGridFeatureState, MuiDataGridInstanceState } from "#root/interfaces/redux";

export const createInitialMuiDataGridInstanceState = (): MuiDataGridInstanceState => ({
    columnVisibilityModel: {},
    columns: [],
    dataGridProps: {},
    defaultVisibleFields: [],
    filterButtonState: {},
    filterButtonValues: {},
    openAdvancedToolbar: false,
    refRows: [],
    rows: [],
    rowsInitialized: false,
    rowSelectionModel: initRowSelectionModel,
    selectedRow: undefined,
    selectedRowId: "",
    selectedRows: [],
});

const initialState: MuiDataGridFeatureState = {
    instances: {},
};

const assertMuiDataGridInstanceId = (instanceId: string) => {
    if (!instanceId) {
        throw new Error("MuiDataGrid instanceId is required.");
    }
};

const ensureMuiDataGridInstance = (state: MuiDataGridFeatureState, instanceId: string) => {
    assertMuiDataGridInstanceId(instanceId);

    if (!state.instances[instanceId]) {
        state.instances[instanceId] =
            createInitialMuiDataGridInstanceState() as (typeof state.instances)[string];
    }

    return state.instances[instanceId];
};

const muiDataGridSlice = createSlice({
    name: "muiDataGridFeature",
    initialState,
    reducers: {
        initializeInstance(
            state, //
            action: PayloadAction<string>
        ) {
            assertMuiDataGridInstanceId(action.payload);

            if (!state.instances[action.payload]) {
                state.instances[action.payload] =
                    createInitialMuiDataGridInstanceState() as (typeof state.instances)[string];
            }
        },
        updateExternalState(
            state, //
            action: PayloadAction<UpdateMuiDataGridExternalStatePayload>
        ) {
            const instanceState = ensureMuiDataGridInstance(state, action.payload.instanceId);

            Object.assign(instanceState, action.payload.externalState);
        },
        removeInstance(
            state, //
            action: PayloadAction<string>
        ) {
            assertMuiDataGridInstanceId(action.payload);

            delete state.instances[action.payload];
        },
        setColumnVisibilityModel(
            state, //
            action: PayloadAction<MuiDataGridInstancePayload<GridColumnVisibilityModel>>
        ) {
            const { instanceId, value } = action.payload;
            ensureMuiDataGridInstance(state, instanceId).columnVisibilityModel = value;
        },
        setColumns(
            state, //
            action: PayloadAction<MuiDataGridInstancePayload<GridColDef[]>>
        ) {
            const { instanceId, value } = action.payload;
            ensureMuiDataGridInstance(state, instanceId).columns = value;
        },
        setDataGridProps(
            state, //
            action: PayloadAction<
                MuiDataGridInstancePayload<MuiDataGridInstanceState["dataGridProps"]>
            >
        ) {
            const { instanceId, value } = action.payload;
            ensureMuiDataGridInstance(state, instanceId).dataGridProps = value;
        },
        setFilterButtonState(
            state, //
            action: PayloadAction<
                MuiDataGridInstancePayload<MuiDataGridInstanceState["filterButtonState"]>
            >
        ) {
            const { instanceId, value } = action.payload;
            ensureMuiDataGridInstance(state, instanceId).filterButtonState = value;
        },
        setFilterButtonValues(
            state, //
            action: PayloadAction<
                MuiDataGridInstancePayload<MuiDataGridInstanceState["filterButtonValues"]>
            >
        ) {
            const { instanceId, value } = action.payload;
            ensureMuiDataGridInstance(state, instanceId).filterButtonValues = value;
        },
        setRowSelectionModel(
            state, //
            action: PayloadAction<MuiDataGridInstancePayload<GridRowSelectionModel>>
        ) {
            const { instanceId, value } = action.payload;
            ensureMuiDataGridInstance(state, instanceId).rowSelectionModel = value;
        },
        setRows(
            state, //
            action: PayloadAction<MuiDataGridInstancePayload<GridValidRowModel[]>>
        ) {
            const { instanceId, value } = action.payload;
            ensureMuiDataGridInstance(state, instanceId).rows = value;
        },
        setRowsInitialized(
            state, //
            action: PayloadAction<MuiDataGridInstancePayload<boolean>>
        ) {
            const { instanceId, value } = action.payload;
            ensureMuiDataGridInstance(state, instanceId).rowsInitialized = value;
        },
        setOpenAdvancedToolbar(
            state, //
            action: PayloadAction<MuiDataGridInstancePayload<boolean>>
        ) {
            const { instanceId, value } = action.payload;
            ensureMuiDataGridInstance(state, instanceId).openAdvancedToolbar = value;
        },
        setSelectedRowId(
            state, //
            action: PayloadAction<MuiDataGridInstancePayload<string>>
        ) {
            const { instanceId, value } = action.payload;
            ensureMuiDataGridInstance(state, instanceId).selectedRowId = value;
        },
        setSelectedRow(
            state, //
            action: PayloadAction<MuiDataGridInstancePayload<GridValidRowModel | undefined>>
        ) {
            const { instanceId, value } = action.payload;
            ensureMuiDataGridInstance(state, instanceId).selectedRow = value;
        },
        setSelectedRows(
            state, //
            action: PayloadAction<MuiDataGridInstancePayload<GridValidRowModel[]>>
        ) {
            const { instanceId, value } = action.payload;
            ensureMuiDataGridInstance(state, instanceId).selectedRows = value;
        },
    },
});

export const {
    initializeInstance,
    updateExternalState,
    removeInstance,
    setColumnVisibilityModel,
    setColumns,
    setDataGridProps,
    setFilterButtonState,
    setFilterButtonValues,
    setRowSelectionModel,
    setRows,
    setRowsInitialized,
    setOpenAdvancedToolbar,
    setSelectedRow,
    setSelectedRowId,
    setSelectedRows,
} = muiDataGridSlice.actions;

export default muiDataGridSlice.reducer;
