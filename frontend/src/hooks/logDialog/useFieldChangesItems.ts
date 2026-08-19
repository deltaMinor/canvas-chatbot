import React from "react";

import { useLogDialogExcludedKeys, useSelectedAuditLog } from "#root/hooks/logDialog";
import { getFieldChangesItems } from "#root/utils/fieldChangesItems";

export const useFieldChangesItems = () => {
    const auditLog = useSelectedAuditLog();
    const excludedKeys = useLogDialogExcludedKeys();

    return React.useMemo(
        () =>
            getFieldChangesItems({
                auditLog,
                excludedKeys,
            }),
        [auditLog, excludedKeys]
    );
};
