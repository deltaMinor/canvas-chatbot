import { SxProps, Theme } from "@mui/material/styles";

import {
    AuditLogActionBackgroundColorMapping,
    AuditLogActionColorMapping,
} from "#root/constants/logs";
import { AuditLog } from "#root/interfaces";
import { convertTimezoneToSGT } from "#root/utils/genericHelper";

export const getAuditLogMetadataDisplay = (auditLog?: AuditLog | null) => {
    const muiAvatarText = auditLog?.username?.[0]?.toUpperCase() || "?";
    const formattedTimestamp = auditLog?.timestamp
        ? convertTimezoneToSGT(auditLog.timestamp)
        : "N/A";

    return {
        muiAvatarText,
        formattedTimestamp,
    };
};

export const getAuditLogActionStyles = (auditLog?: AuditLog | null) => {
    const action = auditLog?.action;

    return {
        metadataSectionStyles: {
            mb: 3,
            bgcolor: "grey.50",
        } as SxProps<Theme>,
        metadataGridStyles: {} as SxProps<Theme>,
        metadataTitleStyles: {
            color: "primary.main",
        } as SxProps<Theme>,
        metadataValueStyles: {
            color: "text.primary",
        } as SxProps<Theme>,
        color: action
            ? AuditLogActionColorMapping[action as keyof typeof AuditLogActionColorMapping]
            : undefined,
        backgroundColor: action
            ? AuditLogActionBackgroundColorMapping[
                  action as keyof typeof AuditLogActionBackgroundColorMapping
              ]
            : undefined,
    };
};
