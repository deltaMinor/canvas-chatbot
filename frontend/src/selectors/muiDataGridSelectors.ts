import type { MuiDataGridInstanceState } from "#root/interfaces/redux";
import { InstanceStateResolver } from "#root/lib/InstanceStateResolver";
import { createInitialMuiDataGridInstanceState } from "#root/redux/muiDataGridSlice";
import { RootState } from "#root/redux/store";

const selectMuiDataGridFeatureState = (state: RootState) => state.muiDataGridFeature.instances;
const initialMuiDataGridInstanceState = createInitialMuiDataGridInstanceState();

export const selectMuiDataGridInstanceState = (
    state: RootState,
    instanceId?: string
): MuiDataGridInstanceState => {
    return InstanceStateResolver.resolve({
        instances: selectMuiDataGridFeatureState(state),
        instanceId,
        createInitialState: () => initialMuiDataGridInstanceState,
    });
};

export const selectMuiDataGridRowSelectionModel = (state: RootState, instanceId?: string) => {
    return selectMuiDataGridInstanceState(state, instanceId).rowSelectionModel;
};

export const selectMuiDataGridColumnVisibilityModel = (state: RootState, instanceId?: string) => {
    return selectMuiDataGridInstanceState(state, instanceId).columnVisibilityModel;
};

export const selectMuiDataGridColumns = (state: RootState, instanceId?: string) => {
    return selectMuiDataGridInstanceState(state, instanceId).columns;
};

export const selectMuiDataGridDataGridProps = (state: RootState, instanceId?: string) => {
    return selectMuiDataGridInstanceState(state, instanceId).dataGridProps;
};

export const selectMuiDataGridSelectedRowId = (state: RootState, instanceId?: string) => {
    return selectMuiDataGridInstanceState(state, instanceId).selectedRowId;
};

export const selectMuiDataGridSelectedRow = (state: RootState, instanceId?: string) => {
    return selectMuiDataGridInstanceState(state, instanceId).selectedRow;
};

export const selectMuiDataGridSelectedRows = (state: RootState, instanceId?: string) => {
    return selectMuiDataGridInstanceState(state, instanceId).selectedRows;
};

export const selectMuiDataGridDefaultVisibleFields = (state: RootState, instanceId?: string) => {
    return selectMuiDataGridInstanceState(state, instanceId).defaultVisibleFields;
};

export const selectMuiDataGridFilterButtonState = (state: RootState, instanceId?: string) => {
    return selectMuiDataGridInstanceState(state, instanceId).filterButtonState;
};

export const selectMuiDataGridFilterButtonValues = (state: RootState, instanceId?: string) => {
    return selectMuiDataGridInstanceState(state, instanceId).filterButtonValues;
};

export const selectMuiDataGridRefRows = (state: RootState, instanceId?: string) => {
    return selectMuiDataGridInstanceState(state, instanceId).refRows;
};

export const selectMuiDataGridRows = (state: RootState, instanceId?: string) => {
    return selectMuiDataGridInstanceState(state, instanceId).rows;
};

export const selectMuiDataGridRowsInitialized = (state: RootState, instanceId?: string) => {
    return selectMuiDataGridInstanceState(state, instanceId).rowsInitialized;
};

export const selectMuiDataGridOpenAdvancedToolbar = (state: RootState, instanceId?: string) => {
    return selectMuiDataGridInstanceState(state, instanceId).openAdvancedToolbar;
};
