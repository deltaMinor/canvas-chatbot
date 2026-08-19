import React from "react";

import { Box, Stack, Typography } from "@mui/material";

import { AuditLog } from "#root/interfaces";

interface IdentifierTooltipContentProps {
    auditLog: AuditLog | null;
}

/**
 * Formats identifier keys from snake_case to Title Case
 * Example: "project_id" -> "Project ID"
 */
const formatIdentifierKey = (key: string): string => {
    return key
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ");
};

const labelStyles: SxProps<Theme> = {
    fontWeight: 600,
    fontSize: "0.8125rem",
    color: "inherit",
    opacity: 0.9,
    mr: 1,
    minWidth: "80px",
};

const valueStyles: SxProps<Theme> = {
    fontFamily: "monospace",
    fontSize: "0.8125rem",
    color: "inherit",
    lineHeight: 1.6,
    wordBreak: "break-all",
};

const itemContainerStyles: SxProps<Theme> = {
    display: "flex",
    alignItems: "flex-start",
};

const IdentifierTooltipContent: React.FC<IdentifierTooltipContentProps> = ({ auditLog }) => {
    const identifiers = React.useMemo(() => {
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

    if (!identifiers || Object.keys(identifiers).length === 0) {
        return <Typography sx={valueStyles}>N/A</Typography>;
    }

    return (
        <Stack spacing={0.75}>
            {Object.entries(identifiers).map(([key, value]) => {
                if (value === undefined || value === null) return null;
                return (
                    <Box
                        key={key}
                        sx={itemContainerStyles}
                    >
                        <Typography sx={labelStyles}>{formatIdentifierKey(key)}:</Typography>
                        <Typography sx={valueStyles}>{String(value)}</Typography>
                    </Box>
                );
            })}
        </Stack>
    );
};

export default React.memo(IdentifierTooltipContent);
