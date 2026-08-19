import React from "react";

import { useSelectedAuditLog } from "#root/hooks/logDialog";
import { formatLogForHumanReadable } from "#root/utils/auditLogUtil";

export interface LogDetailsSummaryParts {
    username: string;
    action: string;
    target: string;
    suffix: string;
    beforeTarget: string;
    afterTarget: string;
}

export const useSummaryParts = () => {
    const auditLog = useSelectedAuditLog();

    return React.useMemo(
        () =>
            auditLog
                ? (formatLogForHumanReadable(auditLog).summary_parts as LogDetailsSummaryParts)
                : null,
        [auditLog]
    );
};
