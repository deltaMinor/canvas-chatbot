import {
    DialogConfirmStateEnum,
    DialogFieldStateEnum,
    LogDialogStateEnum,
} from "#root/enums/dialog";
import {
    initDialogConfirmState,
    initDialogFieldState,
    initLogDialogState,
} from "#root/interfaces/dialog";
import { DialogStateKey, getDialogStoreState } from "#root/redux/dialogSlice";
import app_store, { app_actions } from "#root/redux/store";
import { waitForNextFrame } from "#root/utils/animationFrameUtil";

export const handleCloseDialog = (dialogState: DialogStateKey) => {
    app_store.dispatch(app_actions.dialog.closeDialog(dialogState));
};

export const handleCloseDialogAsync = async (dialogState: DialogStateKey) => {
    handleCloseDialog(dialogState);
    await waitForNextFrame();
};

export const handleOpenDialog = (dialogState: DialogStateKey) => {
    app_store.dispatch(app_actions.dialog.openDialog(dialogState));
};

export const handleCloseDialogConfirm = (dialogState: DialogConfirmStateEnum) => {
    app_store.dispatch(app_actions.dialog.closeDialog(dialogState));
};

export const handleOpenDialogConfirm = (dialogState: DialogConfirmStateEnum) => {
    app_store.dispatch(
        app_actions.dialog.setDialogState(
            getDialogStoreState(initDialogConfirmState) //
        )
    );
    app_store.dispatch(app_actions.dialog.openDialog(dialogState));
};

export const handleCloseDialogField = (dialogState: DialogFieldStateEnum) => {
    app_store.dispatch(app_actions.dialog.closeDialog(dialogState));
};

export const handleOpenDialogField = (dialogState: DialogFieldStateEnum) => {
    app_store.dispatch(
        app_actions.dialog.setDialogState(
            getDialogStoreState(initDialogFieldState) //
        )
    );
    app_store.dispatch(app_actions.dialog.openDialog(dialogState));
};

export const handleCloseLogDialog = (dialogState: LogDialogStateEnum) => {
    app_store.dispatch(app_actions.dialog.closeDialog(dialogState));
};

export const handleOpenLogDialog = (dialogState: LogDialogStateEnum) => {
    app_store.dispatch(
        app_actions.dialog.setDialogState(
            getDialogStoreState(initLogDialogState) //
        )
    );
    app_store.dispatch(app_actions.dialog.openDialog(dialogState));
};

export const handleCloseAllDialogs = () => {
    app_store.dispatch(app_actions.dialog.closeAllDialogs());
};

export interface DialogStoreInterface {
    handleCloseDialog: typeof handleCloseDialog;
    handleCloseDialogAsync: typeof handleCloseDialogAsync;
    handleOpenDialog: typeof handleOpenDialog;
    handleCloseDialogConfirm: typeof handleCloseDialogConfirm;
    handleOpenDialogConfirm: typeof handleOpenDialogConfirm;
    handleCloseDialogField: typeof handleCloseDialogField;
    handleOpenDialogField: typeof handleOpenDialogField;
    handleCloseLogDialog: typeof handleCloseLogDialog;
    handleOpenLogDialog: typeof handleOpenLogDialog;
}
