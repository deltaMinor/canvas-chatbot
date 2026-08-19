import React from "react";

import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import { Box } from "@mui/material";

import MuiTooltip from "#root/components/MuiTooltip";
import { AuditLog } from "#root/interfaces";

import UsernameTooltipContent from "./UsernameTooltipContent";

interface UsernameLabelProps {
    username: string;
    auditLog: AuditLog | null;
}

const wrapperStyles: SxProps<Theme> = {
    display: "inline-flex",
    alignItems: "center",
    gap: 0.5,
    color: "text.primary",
    transition: "all 0.2s ease-in-out",
    borderRadius: "4px",
    px: 0.5,
    py: 0.25,
    mx: 0.25,
    backgroundColor: (theme) => `${theme.palette.text.primary}0a`,
    border: (theme) => `1px solid ${theme.palette.text.primary}33`,
    cursor: "help",
    "&:hover": {
        backgroundColor: (theme) => `${theme.palette.text.primary}14`,
        borderColor: (theme) => theme.palette.text.primary,
        transform: "translateY(-1px)",
        boxShadow: (theme) => `0 2px 4px ${theme.palette.text.primary}20`,
    },
};

const iconStyles: SxProps<Theme> = {
    color: "text.secondary",
};

const UsernameLabel: React.FC<UsernameLabelProps> = ({ username, auditLog }) => {
    return (
        <MuiTooltip
            title={<UsernameTooltipContent auditLog={auditLog} />}
            noMaxWidth
            arrow
        >
            <Box
                component="span"
                sx={wrapperStyles}
                className="log-details-summary__username"
            >
                <PersonOutlineIcon
                    sx={iconStyles}
                    className="log-details-summary__username-icon"
                />
                <Box component="span">{username}</Box>
            </Box>
        </MuiTooltip>
    );
};

export default React.memo(UsernameLabel);
