import React from "react";

import { enqueueSnackbar } from "notistack";

import { useLogDialogInstanceId } from "#root/contexts/LogDialogInstanceContext";
import { LogDialogProps } from "#root/interfaces/logDialog";
import { setLogDialogLoaded, setLogDialogLogs } from "#root/stores/logDialogFeatureStore";

interface UseLogDialogLoadEffectProps {
    getLogs: LogDialogProps["getLogs"];
    open: boolean;
}

export const useLogDialogLoadEffect = ({ getLogs, open }: UseLogDialogLoadEffectProps) => {
    const instanceId = useLogDialogInstanceId();

    const updateLogs = React.useCallback(async () => {
        try {
            const logs = await getLogs();
            setLogDialogLogs(logs, instanceId);
        } catch (e) {
            enqueueSnackbar(`Failed to retrieve logs. ${e}`, {
                variant: "error",
            });
        } finally {
            setLogDialogLoaded(true, instanceId);
        }
    }, [getLogs, instanceId]);

    React.useEffect(() => {
        if (!open) return;

        setLogDialogLoaded(false, instanceId);
        void updateLogs();
    }, [instanceId, open, updateLogs]);
};
