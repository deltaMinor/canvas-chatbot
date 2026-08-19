import React from "react";

import { useSelectedAuditLog } from "#root/hooks/logDialog";

export const useAuditLogIdentifiers = () => {
    const auditLog = useSelectedAuditLog();

    return React.useMemo(() => {
        const fieldChangesIdentifiers = auditLog?.fieldChanges?.["identifiers"];
        if (
            fieldChangesIdentifiers &&
            typeof fieldChangesIdentifiers === "object" &&
            !Array.isArray(fieldChangesIdentifiers)
        ) {
            return fieldChangesIdentifiers as Record<string, string | number | undefined>;
        }
        return null;
    }, [auditLog?.fieldChanges]);
};
