import { GridValidRowModel } from "@mui/x-data-grid";

import { AuditLog } from "#root/interfaces";
import { MuiDataGridTableGetRowIdFromRowProps } from "#root/interfaces/muiDataGridTable";
import { extractIdentifier, formatLogForHumanReadable, getTimeAgo } from "#root/utils/auditLogUtil";

export const getLogRowIdFromRow = ({ row }: MuiDataGridTableGetRowIdFromRowProps): string => {
    return row["logId"] || row["id"] || Math.random().toString(36).substr(2, 9);
};

export const getLogInitRows = ({ refRows }: { refRows: AuditLog[] }): GridValidRowModel[] => {
    return refRows.map((auditLog) => {
        const formattedLog = formatLogForHumanReadable(auditLog);
        const identifier = extractIdentifier(auditLog);
        const summary = `${formattedLog.summary_parts.beforeTarget}${formattedLog.summary_parts.target}${formattedLog.summary_parts.afterTarget}`;

        return {
            id: getLogRowIdFromRow({
                row: auditLog,
                muiDataGridTableInstanceId: "",
            }),
            logId: auditLog.logId || Math.random().toString(36).substr(2, 9),
            identifier,
            action: auditLog.action,
            author: auditLog.username,
            timestamp: auditLog.timestamp,
            timeAgo: getTimeAgo(auditLog.timestamp),
            description: summary,
            summaryIdentifier: identifier !== "N/A" ? identifier : null,
            targetKey: auditLog.targetKey,
            _auditLog: auditLog,
        };
    });
};
