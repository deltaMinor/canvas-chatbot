import React from "react";

import LogDialog from "#root/components/LogDialog";
import { useDialogState } from "#root/hooks/dialogHooks";
import { useMuiDataGridResolvedCallback } from "#root/hooks/muiDataGridTable";
import { GetDialogProps } from "#root/interfaces/dataGrid";
import { LogDialogProps } from "#root/interfaces/logDialog";
import { MuiDataGridTableUseLogDialogProps } from "#root/interfaces/muiDataGridTable";
import { handleCloseDialogAsync } from "#root/stores/dialogStore";

import { useMuiDataGridTableInstanceId } from "../contexts/MuiDataGridTableInstanceContext";

export interface MuiDataGridTableLogDialogProps {
    useLogDialogProps: MuiDataGridTableUseLogDialogProps;
}

const MuiDataGridTableLogDialogComponent = ({
    useLogDialogProps,
}: MuiDataGridTableLogDialogProps) => {
    const logDialogState = useDialogState();
    const muiDataGridTableInstanceId = useMuiDataGridTableInstanceId();
    const getLogDialogProps = useMuiDataGridResolvedCallback<GetDialogProps, LogDialogProps[]>(
        useLogDialogProps
    );

    const logDialogProps = getLogDialogProps?.({ muiDataGridTableInstanceId }) ?? [];

    const handleCloseLogDialog = React.useCallback(async () => {
        logDialogProps.forEach(async (props) => {
            if (logDialogState[props.stateKey]) {
                await handleCloseDialogAsync(props.stateKey);
            }
        });
    }, [logDialogProps, logDialogState]);

    return (
        <>
            {logDialogProps?.map((prop: LogDialogProps, propIdx: number) => {
                const open =
                    !!logDialogState?.[
                        prop.stateKey as keyof typeof logDialogState //
                    ];

                return (
                    <LogDialog.Root
                        key={propIdx}
                        open={open}
                        getLogs={prop.getLogs}
                        handleClose={handleCloseLogDialog}
                    >
                        <LogDialog.Header
                            title={prop.title}
                            {...(prop.subtitle ? { subtitle: prop.subtitle } : {})}
                        />
                        <LogDialog.Body />
                    </LogDialog.Root>
                );
            })}
        </>
    );
};

export default MuiDataGridTableLogDialogComponent;
