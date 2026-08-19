import React from "react";

import LogDialog from "#root/components/LogDialog";
import { LogDialogProps } from "#root/interfaces/logDialog";

interface LogDialogsProps {
    logDialogProps: LogDialogProps[];
    logDialogState: Record<string, boolean>;
    handleCloseLogDialog: () => void;
}

const LogDialogsComponent = ({
    logDialogProps, //
    logDialogState,
    handleCloseLogDialog,
}: LogDialogsProps) => {
    const handleClose = async () => {
        handleCloseLogDialog();
    };

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
                        open={open} //
                        getLogs={prop.getLogs}
                        handleClose={handleClose}
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

export default React.memo(LogDialogsComponent);
