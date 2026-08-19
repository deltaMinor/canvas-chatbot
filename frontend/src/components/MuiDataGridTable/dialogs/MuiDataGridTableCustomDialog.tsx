import React from "react";

import { useDialogState } from "#root/hooks/dialogHooks";
import { useMuiDataGridResolvedCallback } from "#root/hooks/muiDataGridTable";
import { GetDialogProps } from "#root/interfaces/dataGrid";
import {
    DialogCustomProps,
    MuiDataGridTableUseCustomDialogProps,
} from "#root/interfaces/muiDataGridTable";

import { useMuiDataGridTableInstanceId } from "../contexts/MuiDataGridTableInstanceContext";

export interface MuiDataGridTableCustomDialogProps {
    useCustomDialogProps: MuiDataGridTableUseCustomDialogProps;
}

const MuiDataGridTableCustomDialogComponent = ({
    useCustomDialogProps,
}: MuiDataGridTableCustomDialogProps) => {
    const dialogState = useDialogState();
    const muiDataGridTableInstanceId = useMuiDataGridTableInstanceId();
    const getCustomDialogProps = useMuiDataGridResolvedCallback<
        GetDialogProps,
        DialogCustomProps[]
    >(useCustomDialogProps);

    const dialogCustomProps = getCustomDialogProps?.({ muiDataGridTableInstanceId }) ?? [];

    return (
        <React.Fragment>
            {dialogCustomProps?.map((props, index) => {
                const open = !!dialogState?.[props.stateKey as keyof typeof dialogState];
                return (
                    <React.Fragment
                        key={index} //
                    >
                        {props.Component(
                            open //
                        )}
                    </React.Fragment>
                );
            })}
        </React.Fragment>
    );
};

export default MuiDataGridTableCustomDialogComponent;
