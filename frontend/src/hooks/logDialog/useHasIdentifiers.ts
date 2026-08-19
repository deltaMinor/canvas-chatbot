import React from "react";

import { useSelectedAuditLog } from "#root/hooks/logDialog";

export const useHasIdentifiers = () => {
    const auditLog = useSelectedAuditLog();

    return React.useMemo(() => {
        const fieldChangesIdentifiers = auditLog?.fieldChanges?.["identifiers"];
        if (
            fieldChangesIdentifiers &&
            typeof fieldChangesIdentifiers === "object" &&
            !Array.isArray(fieldChangesIdentifiers)
        ) {
            const identifiers = fieldChangesIdentifiers as Record<
                string,
                string | number | undefined
            >;
            return (
                Object.keys(identifiers).length > 0 &&
                Object.values(identifiers).some((v) => v !== undefined && v !== null)
            );
        }
        return false;
    }, [auditLog?.fieldChanges]);
};
