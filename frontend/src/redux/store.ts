import { UnknownAction, combineReducers, configureStore } from "@reduxjs/toolkit";
import { Reducer, Store } from "redux";

import type { RootState } from "#root/interfaces/redux";
import { localStorageListenerMiddleware } from "#root/middleware/localStorageListener";

import appSlice from "./appSlice";
import appVersionFeatureSlice from "./appVersionFeatureSlice";
import backendSlice from "./backendSlice";
import dialogSlice from "./dialogSlice";
import layoutSlice from "./layoutSlice";
import logDialogFeatureReducer, {
    initializeInstance as initializeLogDialogInstanceAction,
    removeInstance as removeLogDialogInstanceAction,
    setDetailsDialogOpen as setLogDialogDetailsDialogOpenAction,
    setExcludedKeys as setLogDialogExcludedKeysAction,
    setLoaded as setLogDialogLoadedAction,
    setLogs as setLogDialogLogsAction,
    setSelectedAuditLogId as setLogDialogSelectedAuditLogIdAction,
} from "./logDialogFeatureSlice";
import muiDataGridFeatureReducer, {
    initializeInstance as initializeMuiDataGridInstanceAction,
    removeInstance as removeMuiDataGridInstanceAction,
    setColumnVisibilityModel as setMuiDataGridColumnVisibilityModelAction,
    setColumns as setMuiDataGridColumnsAction,
    setDataGridProps as setMuiDataGridDataGridPropsAction,
    setFilterButtonState as setMuiDataGridFilterButtonStateAction,
    setFilterButtonValues as setMuiDataGridFilterButtonValuesAction,
    setOpenAdvancedToolbar as setMuiDataGridOpenAdvancedToolbarAction,
    setRowSelectionModel as setMuiDataGridRowSelectionModelAction,
    setRows as setMuiDataGridRowsAction,
    setRowsInitialized as setMuiDataGridRowsInitializedAction,
    setSelectedRow as setMuiDataGridSelectedRowAction,
    setSelectedRowId as setMuiDataGridSelectedRowIdAction,
    setSelectedRows as setMuiDataGridSelectedRowsAction,
    updateExternalState as updateMuiDataGridExternalStateAction,
} from "./muiDataGridSlice";
import projectDiagramFeatureSlice from "./projectDiagramFeatureSlice";

export type { AppDispatch, RootState } from "#root/interfaces/redux";

const app_reducer = {
    app: appSlice.reducer,
    appVersionFeature: appVersionFeatureSlice.reducer,
    backend: backendSlice.reducer,
    logDialogFeature: logDialogFeatureReducer,
    dialog: dialogSlice.reducer,
    diagram: projectDiagramFeatureSlice.reducer,
    layout: layoutSlice.reducer,
    muiDataGridFeature: muiDataGridFeatureReducer,
};

const appReducer = combineReducers(app_reducer);

const rootReducer: Reducer<RootState, UnknownAction> = (state, action) => {
    return appReducer(state, action);
};

export const app_actions = {
    app: appSlice.actions,
    appVersionFeature: appVersionFeatureSlice.actions,
    backend: backendSlice.actions,
    logDialogFeature: {
        initializeInstance: initializeLogDialogInstanceAction,
        removeInstance: removeLogDialogInstanceAction,
        setLogs: setLogDialogLogsAction,
        setDetailsDialogOpen: setLogDialogDetailsDialogOpenAction,
        setExcludedKeys: setLogDialogExcludedKeysAction,
        setLoaded: setLogDialogLoadedAction,
        setSelectedAuditLogId: setLogDialogSelectedAuditLogIdAction,
    },
    dialog: dialogSlice.actions,
    diagram: projectDiagramFeatureSlice.actions,
    layout: layoutSlice.actions,
    muiDataGridFeature: {
        initializeInstance: initializeMuiDataGridInstanceAction,
        removeInstance: removeMuiDataGridInstanceAction,
        setColumnVisibilityModel: setMuiDataGridColumnVisibilityModelAction,
        setColumns: setMuiDataGridColumnsAction,
        setDataGridProps: setMuiDataGridDataGridPropsAction,
        setFilterButtonState: setMuiDataGridFilterButtonStateAction,
        setFilterButtonValues: setMuiDataGridFilterButtonValuesAction,
        setOpenAdvancedToolbar: setMuiDataGridOpenAdvancedToolbarAction,
        setRowSelectionModel: setMuiDataGridRowSelectionModelAction,
        setRows: setMuiDataGridRowsAction,
        setRowsInitialized: setMuiDataGridRowsInitializedAction,
        setSelectedRow: setMuiDataGridSelectedRowAction,
        setSelectedRowId: setMuiDataGridSelectedRowIdAction,
        setSelectedRows: setMuiDataGridSelectedRowsAction,
        updateExternalState: updateMuiDataGridExternalStateAction,
    },
};

const app_store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [
                    "muiDataGridFeature/setRowSelectionModel",
                    "muiDataGridFeature/setColumns",
                    "muiDataGridFeature/setDataGridProps",
                    "muiDataGridFeature/setSelectedRow",
                    "muiDataGridFeature/setSelectedRows",
                    "muiDataGridFeature/updateExternalState",
                ],
                ignoredPaths: ["muiDataGridFeature.instances"],
            },
        }).prepend(localStorageListenerMiddleware.middleware),
});

const app_store_export: Store<RootState> = app_store;

export default app_store_export;
