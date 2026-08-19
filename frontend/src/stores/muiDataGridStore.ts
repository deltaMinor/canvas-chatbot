import React from "react";

import {
    DataGridProps,
    GridColDef,
    GridColumnVisibilityModel,
    GridRowSelectionModel,
    GridValidRowModel,
} from "@mui/x-data-grid";

import { initRowSelectionModel } from "#root/constants/dataGrid";
import {
    MuiFilterButtonStateProps,
    MuiFilterButtonValueProps,
} from "#root/interfaces/muiDataGridTable";
import app_store, { app_actions } from "#root/redux/store";
import {
    selectMuiDataGridColumnVisibilityModel,
    selectMuiDataGridColumns,
    selectMuiDataGridDataGridProps,
    selectMuiDataGridDefaultVisibleFields,
    selectMuiDataGridFilterButtonState,
    selectMuiDataGridFilterButtonValues,
    selectMuiDataGridOpenAdvancedToolbar,
    selectMuiDataGridRefRows,
    selectMuiDataGridRowSelectionModel,
    selectMuiDataGridRows,
    selectMuiDataGridRowsInitialized,
    selectMuiDataGridSelectedRow,
    selectMuiDataGridSelectedRowId,
    selectMuiDataGridSelectedRows,
} from "#root/selectors/muiDataGridSelectors";

import { getRootStateFromStore } from "./root";

const resolveNextStateAction = <T>(value: React.SetStateAction<T>, currentValue: T): T => {
    return typeof value === "function" ? (value as (previousValue: T) => T)(currentValue) : value;
};

const areArraysShallowEqual = <T>(left: T[], right: T[]) => {
    return left.length === right.length && left.every((item, index) => item === right[index]);
};

const areObjectsShallowEqual = <T extends object>(left: T, right: T) => {
    const leftKeys = Object.keys(left) as (keyof T)[];
    const rightKeys = Object.keys(right) as (keyof T)[];

    return (
        leftKeys.length === rightKeys.length &&
        leftKeys.every((key) => Object.prototype.hasOwnProperty.call(right, key)) &&
        leftKeys.every((key) => left[key] === right[key])
    );
};

const areGridColumnsEqual = (left: GridColDef[], right: GridColDef[]) => {
    return (
        left.length === right.length &&
        left.every((column, index) => {
            const rightColumn = right[index];
            return !!rightColumn && areObjectsShallowEqual(column, rightColumn);
        })
    );
};

export const initializeMuiDataGridInstance = (instanceId: string) => {
    app_store.dispatch(app_actions.muiDataGridFeature.initializeInstance(instanceId));
};

export const removeMuiDataGridInstance = (instanceId: string) => {
    app_store.dispatch(app_actions.muiDataGridFeature.removeInstance(instanceId));
};

export const updateMuiDataGridExternalState = (
    instanceId: string,
    externalState?: Parameters<
        typeof app_actions.muiDataGridFeature.updateExternalState
    >[0]["externalState"]
) => {
    app_store.dispatch(
        app_actions.muiDataGridFeature.updateExternalState(
            externalState ? { instanceId, externalState } : { instanceId }
        )
    );
};

export const getMuiDataGridRowSelectionModelFromStore = (
    instanceId: string
): GridRowSelectionModel => {
    return selectMuiDataGridRowSelectionModel(getRootStateFromStore(), instanceId);
};

export const getMuiDataGridColumnVisibilityModelFromStore = (
    instanceId: string
): GridColumnVisibilityModel => {
    return selectMuiDataGridColumnVisibilityModel(getRootStateFromStore(), instanceId);
};

export const setMuiDataGridColumnVisibilityModel = (
    value: React.SetStateAction<GridColumnVisibilityModel>,
    instanceId: string
) => {
    const nextValue = resolveNextStateAction(
        value,
        getMuiDataGridColumnVisibilityModelFromStore(instanceId)
    );
    app_store.dispatch(
        app_actions.muiDataGridFeature.setColumnVisibilityModel({
            instanceId,
            value: nextValue,
        })
    );
};

export const getMuiDataGridColumnsFromStore = (instanceId: string): GridColDef[] => {
    return selectMuiDataGridColumns(getRootStateFromStore(), instanceId);
};

export const setMuiDataGridColumns = (
    value: React.SetStateAction<GridColDef[]>,
    instanceId: string
) => {
    const currentValue = getMuiDataGridColumnsFromStore(instanceId);
    const nextValue = resolveNextStateAction(value, currentValue);
    if (areGridColumnsEqual(currentValue, nextValue)) {
        return;
    }

    app_store.dispatch(app_actions.muiDataGridFeature.setColumns({ instanceId, value: nextValue }));
};

export const getMuiDataGridDataGridPropsFromStore = (
    instanceId: string
): Partial<Record<keyof DataGridProps, unknown>> => {
    return selectMuiDataGridDataGridProps(getRootStateFromStore(), instanceId);
};

export const setMuiDataGridDataGridProps = (
    value: React.SetStateAction<Partial<DataGridProps>>,
    instanceId: string
) => {
    const nextValue = resolveNextStateAction(
        value as React.SetStateAction<Partial<Record<keyof DataGridProps, unknown>>>,
        getMuiDataGridDataGridPropsFromStore(instanceId)
    );
    app_store.dispatch(
        app_actions.muiDataGridFeature.setDataGridProps({ instanceId, value: nextValue })
    );
};

export const setMuiDataGridRowSelectionModel = (
    value: React.SetStateAction<GridRowSelectionModel>,
    instanceId: string
) => {
    const nextValue = resolveNextStateAction(
        value,
        getMuiDataGridRowSelectionModelFromStore(instanceId)
    );
    app_store.dispatch(
        app_actions.muiDataGridFeature.setRowSelectionModel({ instanceId, value: nextValue })
    );
};

export const getMuiDataGridSelectedRowIdFromStore = (instanceId: string): string => {
    return selectMuiDataGridSelectedRowId(getRootStateFromStore(), instanceId);
};

export const setMuiDataGridSelectedRowId = (
    value: React.SetStateAction<string>,
    instanceId: string
) => {
    const nextValue = resolveNextStateAction(
        value,
        getMuiDataGridSelectedRowIdFromStore(instanceId)
    );
    app_store.dispatch(
        app_actions.muiDataGridFeature.setSelectedRowId({ instanceId, value: nextValue })
    );
};

export const getMuiDataGridSelectedRowFromStore = (
    instanceId: string
): GridValidRowModel | undefined => {
    return selectMuiDataGridSelectedRow(getRootStateFromStore(), instanceId);
};

export const setMuiDataGridSelectedRow = (
    value: React.SetStateAction<GridValidRowModel | undefined>,
    instanceId: string
) => {
    const currentValue = getMuiDataGridSelectedRowFromStore(instanceId);
    const nextValue = resolveNextStateAction(value, currentValue);
    if (currentValue === nextValue) return;

    app_store.dispatch(
        app_actions.muiDataGridFeature.setSelectedRow({ instanceId, value: nextValue })
    );
};

export const getMuiDataGridSelectedRowsFromStore = (instanceId: string): GridValidRowModel[] => {
    return selectMuiDataGridSelectedRows(getRootStateFromStore(), instanceId);
};

export const setMuiDataGridSelectedRows = (
    value: React.SetStateAction<GridValidRowModel[]>,
    instanceId: string
) => {
    const currentValue = getMuiDataGridSelectedRowsFromStore(instanceId);
    const nextValue = resolveNextStateAction(value, currentValue);
    if (areArraysShallowEqual(currentValue, nextValue)) return;

    app_store.dispatch(
        app_actions.muiDataGridFeature.setSelectedRows({ instanceId, value: nextValue })
    );
};

export const getMuiDataGridDefaultVisibleFieldsFromStore = (instanceId: string): string[] => {
    return selectMuiDataGridDefaultVisibleFields(getRootStateFromStore(), instanceId);
};

export const getMuiDataGridFilterButtonStateFromStore = (instanceId: string) => {
    return selectMuiDataGridFilterButtonState(getRootStateFromStore(), instanceId);
};

export const setMuiDataGridFilterButtonState = (
    value: React.SetStateAction<MuiFilterButtonStateProps>,
    instanceId: string
) => {
    const nextValue = resolveNextStateAction(
        value,
        getMuiDataGridFilterButtonStateFromStore(instanceId)
    );
    app_store.dispatch(
        app_actions.muiDataGridFeature.setFilterButtonState({ instanceId, value: nextValue })
    );
};

export const getMuiDataGridFilterButtonValuesFromStore = (instanceId: string) => {
    return selectMuiDataGridFilterButtonValues(getRootStateFromStore(), instanceId);
};

export const setMuiDataGridFilterButtonValues = (
    value: React.SetStateAction<MuiFilterButtonValueProps>,
    instanceId: string
) => {
    const nextValue = resolveNextStateAction(
        value,
        getMuiDataGridFilterButtonValuesFromStore(instanceId)
    );
    app_store.dispatch(
        app_actions.muiDataGridFeature.setFilterButtonValues({ instanceId, value: nextValue })
    );
};

export const getMuiDataGridRefRowsFromStore = (instanceId: string): unknown[] => {
    return selectMuiDataGridRefRows(getRootStateFromStore(), instanceId);
};

export const getMuiDataGridRowsFromStore = (instanceId: string): GridValidRowModel[] => {
    return selectMuiDataGridRows(getRootStateFromStore(), instanceId);
};

export const setMuiDataGridRows = (
    value: React.SetStateAction<GridValidRowModel[]>,
    instanceId: string
) => {
    const currentValue = getMuiDataGridRowsFromStore(instanceId);
    const nextValue = resolveNextStateAction(value, currentValue);
    if (areArraysShallowEqual(currentValue, nextValue)) return;

    app_store.dispatch(app_actions.muiDataGridFeature.setRows({ instanceId, value: nextValue }));
};

export const getMuiDataGridRowsInitializedFromStore = (instanceId: string): boolean => {
    return selectMuiDataGridRowsInitialized(getRootStateFromStore(), instanceId);
};

export const setMuiDataGridRowsInitialized = (
    value: React.SetStateAction<boolean>,
    instanceId: string
) => {
    const nextValue = resolveNextStateAction(
        value,
        getMuiDataGridRowsInitializedFromStore(instanceId)
    );
    app_store.dispatch(
        app_actions.muiDataGridFeature.setRowsInitialized({ instanceId, value: nextValue })
    );
};

export const getMuiDataGridOpenAdvancedToolbarFromStore = (instanceId: string): boolean => {
    return selectMuiDataGridOpenAdvancedToolbar(getRootStateFromStore(), instanceId);
};

export const setMuiDataGridOpenAdvancedToolbar = (
    value: React.SetStateAction<boolean>,
    instanceId: string
) => {
    const nextValue = resolveNextStateAction(
        value,
        getMuiDataGridOpenAdvancedToolbarFromStore(instanceId)
    );
    app_store.dispatch(
        app_actions.muiDataGridFeature.setOpenAdvancedToolbar({ instanceId, value: nextValue })
    );
};

export const resetMuiDataGridSelection = (instanceId: string) => {
    setMuiDataGridRowSelectionModel(initRowSelectionModel, instanceId);
    setMuiDataGridSelectedRowId("", instanceId);
};
