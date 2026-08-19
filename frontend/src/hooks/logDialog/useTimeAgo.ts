import React from "react";

import { useSelectedAuditLog } from "#root/hooks/logDialog";
import { getTimeAgo } from "#root/utils/auditLogUtil";

export const useTimeAgo = () => {
    const auditLog = useSelectedAuditLog();

    return React.useMemo(() => {
        if (!auditLog?.timestamp) return null;
        return getTimeAgo(auditLog.timestamp);
    }, [auditLog]);
};
