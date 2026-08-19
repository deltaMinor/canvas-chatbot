import React from "react";

import { useLogDialogLoadEffect } from "#root/hooks/logDialog";
import { LogDialogProps } from "#root/interfaces/logDialog";

interface LogDialogEffectsProps {
    getLogs: LogDialogProps["getLogs"];
    open: boolean;
}

const LogDialogEffectsComponent = ({ getLogs, open }: LogDialogEffectsProps) => {
    useLogDialogLoadEffect({
        getLogs,
        open,
    });

    return null;
};

export default React.memo(LogDialogEffectsComponent);
