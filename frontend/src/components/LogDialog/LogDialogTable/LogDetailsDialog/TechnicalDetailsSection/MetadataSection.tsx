import React from "react";

import { Box, Stack, Typography } from "@mui/material";

import MuiAvatar from "#root/components/MuiAvatar";
import MuiChip from "#root/components/MuiChip";
import { useAuditLogIdentifiers, useSelectedAuditLog } from "#root/hooks/logDialog";
import { formatIdentifierKey } from "#root/utils/formatIdentifierKey";
import {
    getAuditLogActionStyles,
    getAuditLogMetadataDisplay,
} from "#root/utils/logDialogMetadataUtil";

import AuditLogUserTooltip from "./AuditLogUserTooltip";
import MetadataItem from "./MetadataItem";

const MetadataSection = () => {
    const auditLog = useSelectedAuditLog();
    const identifiers = useAuditLogIdentifiers();

    if (!auditLog) return null;

    const { muiAvatarText, formattedTimestamp } = getAuditLogMetadataDisplay(auditLog);
    const {
        backgroundColor,
        color,
        metadataGridStyles,
        metadataSectionStyles,
        metadataTitleStyles,
        metadataValueStyles,
    } = getAuditLogActionStyles(auditLog);

    return (
        <Box
            sx={metadataSectionStyles}
            className="log-details-metadata-section"
        >
            <Typography
                variant="subtitle2"
                sx={metadataTitleStyles}
                className="log-details-metadata-section__title"
            >
                Metadata
            </Typography>
            <Box
                sx={metadataGridStyles}
                className="log-details-metadata-section__grid"
            >
                <MetadataItem
                    label="Action"
                    value={
                        <MuiChip
                            label={auditLog?.action}
                            isUpperCase
                            style={{
                                backgroundColor,
                                color,
                            }}
                        />
                    }
                />
                <MetadataItem
                    label="Timestamp"
                    value={
                        <Typography
                            variant="body2"
                            sx={metadataValueStyles}
                            className="log-details-metadata-section__value"
                        >
                            {formattedTimestamp}
                        </Typography>
                    }
                />
                <MetadataItem
                    label="User"
                    value={
                        <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                        >
                            <MuiAvatar tooltipTitle={<AuditLogUserTooltip auditLog={auditLog} />}>
                                {muiAvatarText}
                            </MuiAvatar>
                            <Typography
                                variant="body2"
                                sx={metadataValueStyles}
                                className="log-details-metadata-section__value"
                            >
                                {auditLog?.username || "N/A"}
                            </Typography>
                        </Stack>
                    }
                />
                {auditLog?.user_id && (
                    <MetadataItem
                        label="User ID"
                        value={
                            <Typography
                                variant="body2"
                                sx={{
                                    ...metadataValueStyles,
                                }}
                                className="log-details-metadata-section__mono-value"
                            >
                                {auditLog.user_id}
                            </Typography>
                        }
                    />
                )}
                {auditLog?.logId && (
                    <MetadataItem
                        label="Log ID"
                        value={
                            <Typography
                                variant="body2"
                                sx={{
                                    ...metadataValueStyles,
                                }}
                                className="log-details-metadata-section__mono-value"
                            >
                                {auditLog.logId}
                            </Typography>
                        }
                    />
                )}
                {auditLog?.targetKey && (
                    <MetadataItem
                        label="Target Key"
                        value={
                            <Typography
                                variant="body2"
                                sx={{
                                    ...metadataValueStyles,
                                }}
                                className="log-details-metadata-section__mono-value"
                            >
                                {auditLog.targetKey}
                            </Typography>
                        }
                    />
                )}
                {identifiers &&
                    Object.entries(identifiers).map(([key, value]) => {
                        if (value === undefined || value === null) return null;
                        return (
                            <MetadataItem
                                key={key}
                                label={formatIdentifierKey(key)}
                                value={
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            ...metadataValueStyles,
                                        }}
                                        className="log-details-metadata-section__mono-value"
                                    >
                                        {String(value)}
                                    </Typography>
                                }
                            />
                        );
                    })}
            </Box>
        </Box>
    );
};

export default React.memo(MetadataSection);
