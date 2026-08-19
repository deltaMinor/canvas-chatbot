import React from "react";

import InventoryIcon from "@mui/icons-material/Inventory";
import { Box } from "@mui/material";
import { SxProps, Theme } from "@mui/material/styles";

import MuiTooltip from "#root/components/MuiTooltip";
import {
    useHasIdentifiers,
    useSelectedAuditLog,
    useSummaryParts,
    useTimeAgo,
} from "#root/hooks/logDialog";

import IdentifierTooltipContent from "./IdentifierTooltipContent";
import UsernameLabel from "./UsernameLabel";

const actionStyles: SxProps<Theme> = {
    color: "text.primary",
};

const targetBaseStyles: SxProps<Theme> = {
    color: "primary.main",
    px: 0.5,
    py: 0.25,
    mx: 0.25,
    backgroundColor: (theme) => `${theme.palette.primary.main}0a`,
    border: (theme) => `1px solid ${theme.palette.primary.main}33`,
};

const targetWithTooltipStyles: SxProps<Theme> = {
    ...targetBaseStyles,
    "&:hover": {
        color: "primary.dark",
        backgroundColor: (theme) => `${theme.palette.primary.main}14`,
        borderColor: (theme) => theme.palette.primary.main,
        boxShadow: (theme) => `0 2px 4px ${theme.palette.primary.main}20`,
    },
};

const targetWithoutTooltipStyles: SxProps<Theme> = {
    ...targetBaseStyles,
};

const LogDetailsSummary = () => {
    const auditLog = useSelectedAuditLog();
    const parts = useSummaryParts();
    const hasIdentifiers = useHasIdentifiers();
    const timeAgo = useTimeAgo();

    if (!auditLog) return null;
    if (!parts) return null;

    const { username, action, target, beforeTarget, afterTarget } = parts;

    if (!target) {
        return (
            <>
                {beforeTarget}
                {target}
                {afterTarget}
            </>
        );
    }

    const targetElement = hasIdentifiers ? (
        <MuiTooltip
            title={<IdentifierTooltipContent auditLog={auditLog} />}
            noMaxWidth
            arrow
        >
            <Box
                component="span"
                sx={targetWithTooltipStyles}
                className="log-details-summary__target"
            >
                <InventoryIcon className="log-details-summary__target-icon" />
                {target}
            </Box>
        </MuiTooltip>
    ) : (
        <Box
            component="span"
            sx={targetWithoutTooltipStyles}
            className="log-details-summary__target"
        >
            <InventoryIcon className="log-details-summary__target-icon" />
            {target}
        </Box>
    );

    return (
        <>
            <UsernameLabel
                username={username}
                auditLog={auditLog}
            />{" "}
            <Box
                component="span"
                sx={actionStyles}
                className="log-details-summary__action"
            >
                {action}
            </Box>{" "}
            {targetElement}
            {afterTarget}
            {timeAgo && ` ${timeAgo}`}
        </>
    );
};

export default React.memo(LogDetailsSummary);
