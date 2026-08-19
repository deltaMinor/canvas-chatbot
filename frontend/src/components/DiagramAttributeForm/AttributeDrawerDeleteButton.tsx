import React from "react";

import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import { IconButton, alpha } from "@mui/material";

import MuiTooltip from "#root/components/MuiTooltip";

export interface AttributeDrawerDeleteButtonProps {
    title: string;
    ariaLabel: string;
    onClick: () => Promise<void> | void;
}

const AttributeDrawerDeleteButtonComponent = ({
    title,
    ariaLabel,
    onClick,
}: AttributeDrawerDeleteButtonProps) => {
    return (
        <MuiTooltip title={title}>
            <span>
                <IconButton
                    onClick={onClick}
                    size="small"
                    sx={(theme) => ({
                        width: 34,
                        height: 34,
                        borderRadius: 1.5,
                        border: `1px solid ${theme.palette.error.light}`,
                        color: "error.main",
                        "&:hover": {
                            backgroundColor: alpha(theme.palette.error.main, 0.08),
                            borderColor: theme.palette.error.main,
                        },
                    })}
                    aria-label={ariaLabel}
                >
                    <DeleteOutlineRoundedIcon fontSize="small" />
                </IconButton>
            </span>
        </MuiTooltip>
    );
};

export default React.memo(
    AttributeDrawerDeleteButtonComponent
) as typeof AttributeDrawerDeleteButtonComponent;
