import React from "react";

import { Box, Stack, Typography } from "@mui/material";

import { AuditLog } from "#root/interfaces";

interface UsernameTooltipContentProps {
    auditLog: AuditLog | null;
}

const labelStyles: SxProps<Theme> = {
    fontWeight: 600,
    fontSize: "0.8125rem",
    color: "inherit",
    opacity: 0.9,
    mr: 1,
    minWidth: "80px",
};

const valueStyles: SxProps<Theme> = {
    fontSize: "0.8125rem",
    color: "inherit",
    lineHeight: 1.6,
    wordBreak: "break-all",
};

const itemContainerStyles: SxProps<Theme> = {
    display: "flex",
    alignItems: "flex-start",
};

const UsernameTooltipContent: React.FC<UsernameTooltipContentProps> = ({ auditLog }) => {
    if (!auditLog) {
        return <Typography sx={valueStyles}>N/A</Typography>;
    }

    return (
        <Stack spacing={0.75}>
            {auditLog.username && (
                <Box sx={itemContainerStyles}>
                    <Typography sx={labelStyles}>Username:</Typography>
                    <Typography sx={valueStyles}>{auditLog.username}</Typography>
                </Box>
            )}
            {auditLog.user_id && (
                <Box sx={itemContainerStyles}>
                    <Typography sx={labelStyles}>User ID:</Typography>
                    <Typography
                        sx={{
                            ...valueStyles,
                            fontFamily: "monospace",
                            fontSize: "0.8125rem",
                        }}
                    >
                        {String(auditLog.user_id)}
                    </Typography>
                </Box>
            )}
            {!auditLog.username && !auditLog.user_id && (
                <Typography sx={valueStyles}>N/A</Typography>
            )}
        </Stack>
    );
};

export default React.memo(UsernameTooltipContent);
