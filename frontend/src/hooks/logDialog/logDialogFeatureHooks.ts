import React from "react";
import { useSelector } from "react-redux";

import { getLogRowIdFromRow } from "#root/components/LogDialog/LogDialogTable/rows";
import { useLogDialogInstanceId } from "#root/contexts/LogDialogInstanceContext";
import { RootState } from "#root/redux/store";
import {
    selectLogDialogDetailsDialogOpen,
    selectLogDialogExcludedKeys,
    selectLogDialogLoaded,
    selectLogDialogLogs,
    selectLogDialogSelectedAuditLogId,
} from "#root/selectors/logDialogFeatureSelectors";

export const useLogDialogLoaded = () => {
    const instanceId = useLogDialogInstanceId();
    return useSelector((state: RootState) => selectLogDialogLoaded(state, instanceId));
};

export const useLogDialogLogs = () => {
    const instanceId = useLogDialogInstanceId();
    return useSelector((state: RootState) => selectLogDialogLogs(state, instanceId));
};

export const useLogDialogDetailsDialogOpen = () => {
    const instanceId = useLogDialogInstanceId();
    return useSelector((state: RootState) => selectLogDialogDetailsDialogOpen(state, instanceId));
};

export const useLogDialogExcludedKeys = () => {
    const instanceId = useLogDialogInstanceId();
    return useSelector((state: RootState) => selectLogDialogExcludedKeys(state, instanceId));
};

export const useLogDialogSelectedAuditLogId = () => {
    const instanceId = useLogDialogInstanceId();
    return useSelector((state: RootState) => selectLogDialogSelectedAuditLogId(state, instanceId));
};

export const useSelectedAuditLog = () => {
    const logs = useLogDialogLogs();
    const selectedAuditLogId = useLogDialogSelectedAuditLogId();

    return React.useMemo(() => {
        if (!selectedAuditLogId) return null;
        return (
            (logs || []).find(
                (log) =>
                    getLogRowIdFromRow({
                        row: log,
                        muiDataGridTableInstanceId: "",
                    }) === selectedAuditLogId
            ) || null
        );
    }, [logs, selectedAuditLogId]);
};
