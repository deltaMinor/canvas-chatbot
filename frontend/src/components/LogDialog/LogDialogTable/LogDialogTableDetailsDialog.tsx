import React from "react";

import { useLogDialogInstanceId } from "#root/contexts/LogDialogInstanceContext";
import { useLogDialogDetailsDialogOpen } from "#root/hooks/logDialog";
import {
    setLogDialogDetailsDialogOpen,
    setLogDialogSelectedAuditLogId,
} from "#root/stores/logDialogFeatureStore";

import LogDetailsDialog from "./LogDetailsDialog";

interface LogDialogTableDetailsDialogProps {}

const LogDialogTableDetailsDialogComponent = (_props: LogDialogTableDetailsDialogProps) => {
    const detailsDialogOpen = useLogDialogDetailsDialogOpen();
    const logDialogInstanceId = useLogDialogInstanceId();

    const handleCloseDetailsDialog = React.useCallback(() => {
        setLogDialogDetailsDialogOpen(false, logDialogInstanceId);
        setLogDialogSelectedAuditLogId(null, logDialogInstanceId);
    }, [logDialogInstanceId]);

    return (
        <LogDetailsDialog.Root
            open={detailsDialogOpen}
            onClose={handleCloseDetailsDialog}
        >
            <LogDetailsDialog.Header />
            <LogDetailsDialog.Body />
        </LogDetailsDialog.Root>
    );
};

export default React.memo(LogDialogTableDetailsDialogComponent);
