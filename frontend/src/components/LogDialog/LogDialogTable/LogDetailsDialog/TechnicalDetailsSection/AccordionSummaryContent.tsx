import React from "react";

import { Box, Stack, Typography } from "@mui/material";
import { SxProps, Theme } from "@mui/material/styles";

import MuiAvatar from "#root/components/MuiAvatar";
import MuiChip from "#root/components/MuiChip";
import {
    AuditLogActionBackgroundColorMapping,
    AuditLogActionColorMapping,
} from "#root/constants/logs";
import { useSelectedAuditLog } from "#root/hooks/logDialog";
import { convertTimezoneToSGT } from "#root/utils/genericHelper";

import AuditLogUserTooltip from "./AuditLogUserTooltip";

const summaryStackStyles: SxProps<Theme> = {
    width: "100%",
    pr: 1,
};

const summaryRowStyles: SxProps<Theme> = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 2,
    width: "100%",
};

const metadataItemStyles: SxProps<Theme> = {
    display: "flex",
    alignItems: "center",
    gap: 1.5,
};

const AccordionSummaryContent = () => {
    const auditLog = useSelectedAuditLog();

    if (!auditLog) return null;

    const muiAvatarText = auditLog?.username?.[0]?.toUpperCase() || "?";
    const formattedTimestamp = auditLog?.timestamp
        ? convertTimezoneToSGT(auditLog.timestamp)
        : "N/A";
    const color =
        AuditLogActionColorMapping?.[auditLog?.action as keyof typeof AuditLogActionColorMapping];
    const backgroundColor =
        AuditLogActionBackgroundColorMapping?.[
            auditLog?.action as keyof typeof AuditLogActionBackgroundColorMapping
        ];

    return (
        <Stack
            spacing={1}
            sx={summaryStackStyles}
            className="log-details-technical-summary"
        >
            <Box
                sx={summaryRowStyles}
                className="log-details-technical-summary__row"
            >
                <Stack
                    direction="row"
                    spacing={2}
                    alignItems="center"
                    sx={metadataItemStyles}
                    className="log-details-technical-summary__meta"
                >
                    <MuiChip
                        label={auditLog?.action}
                        isUpperCase
                        style={{
                            backgroundColor,
                            color,
                        }}
                    />
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontWeight: 500 }}
                        className="log-details-technical-summary__timestamp"
                    >
                        {formattedTimestamp}
                    </Typography>
                </Stack>
                <MuiAvatar //
                    tooltipTitle={
                        <AuditLogUserTooltip //
                            auditLog={auditLog}
                        />
                    }
                >
                    {muiAvatarText}
                </MuiAvatar>
            </Box>
            <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: "0.75rem" }}
                className="log-details-technical-summary__hint"
            >
                Click to view full technical details
            </Typography>
        </Stack>
    );
};

export default React.memo(AccordionSummaryContent);
