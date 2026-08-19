import React from "react";

import DialogConfirm from "#root/components/DialogConfirm";
import { useDialogState } from "#root/hooks/dialogHooks";
import { useMuiDataGridResolvedCallback } from "#root/hooks/muiDataGridTable";
import { GetDialogProps } from "#root/interfaces/dataGrid";
import { ConfirmDialogProps } from "#root/interfaces/dialogConfirm";
import { MuiDataGridTableUseConfirmDialogProps } from "#root/interfaces/muiDataGridTable";
import { DialogStateKey } from "#root/redux/dialogSlice";
import { handleCloseDialogAsync } from "#root/stores/dialogStore";

import { useMuiDataGridTableInstanceId } from "../contexts/MuiDataGridTableInstanceContext";

export interface MuiDataGridTableConfirmDialogProps {
    useConfirmDialogProps: MuiDataGridTableUseConfirmDialogProps;
}

const MuiDataGridTableConfirmDialogComponent = ({
    useConfirmDialogProps,
}: MuiDataGridTableConfirmDialogProps) => {
    const dialogConfirmState = useDialogState();
    const muiDataGridTableInstanceId = useMuiDataGridTableInstanceId();
    const getConfirmDialogProps = useMuiDataGridResolvedCallback<
        GetDialogProps,
        ConfirmDialogProps[]
    >(useConfirmDialogProps);

    const dialogConfirmProps = getConfirmDialogProps?.({ muiDataGridTableInstanceId }) ?? [];

    const handleCloseDialogConfirm = React.useCallback(() => {
        dialogConfirmProps.forEach(async (props) => {
            if (dialogConfirmState[props.stateKey]) {
                await handleCloseDialogAsync(props.stateKey as DialogStateKey);
            }
        });
    }, [dialogConfirmProps, dialogConfirmState]);

    return (
        <DialogConfirm
            dialogConfirmProps={dialogConfirmProps}
            dialogConfirmState={dialogConfirmState}
            handleCloseDialogConfirm={handleCloseDialogConfirm}
        />
    );
};

export default MuiDataGridTableConfirmDialogComponent;
