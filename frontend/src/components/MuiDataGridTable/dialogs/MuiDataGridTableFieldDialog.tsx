import React from "react";

import DialogFields from "#root/components/DialogFields";
import { useDialogState } from "#root/hooks/dialogHooks";
import { useMuiDataGridResolvedCallback } from "#root/hooks/muiDataGridTable";
import { GetDialogProps } from "#root/interfaces/dataGrid";
import { DialogFieldProp } from "#root/interfaces/dialogField";
import { MuiDataGridTableUseFieldDialogProps } from "#root/interfaces/muiDataGridTable";
import { DialogStateKey } from "#root/redux/dialogSlice";
import { handleCloseDialogAsync } from "#root/stores/dialogStore";

import { useMuiDataGridTableInstanceId } from "../contexts/MuiDataGridTableInstanceContext";

export interface MuiDataGridTableFieldDialogProps {
    useFieldDialogProps: MuiDataGridTableUseFieldDialogProps;
}

const MuiDataGridTableFieldDialogComponent = ({
    useFieldDialogProps,
}: MuiDataGridTableFieldDialogProps) => {
    const dialogFieldState = useDialogState();
    const muiDataGridTableInstanceId = useMuiDataGridTableInstanceId();
    const getFieldDialogProps = useMuiDataGridResolvedCallback<GetDialogProps, DialogFieldProp[]>(
        useFieldDialogProps
    );

    const dialogFieldProps = getFieldDialogProps?.({ muiDataGridTableInstanceId }) ?? [];

    const handleCloseDialogField = React.useCallback(() => {
        dialogFieldProps.forEach(async (props) => {
            if (dialogFieldState[props.stateKey]) {
                await handleCloseDialogAsync(props.stateKey as DialogStateKey);
            }
        });
    }, [dialogFieldProps, dialogFieldState]);

    return (
        <DialogFields
            dialogFieldProps={dialogFieldProps}
            dialogFieldState={dialogFieldState}
            handleCloseDialogField={handleCloseDialogField}
        />
    );
};

export default MuiDataGridTableFieldDialogComponent;
