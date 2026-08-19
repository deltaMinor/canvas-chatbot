import React from "react";

import { ButtonProps } from "@mui/material";

import MuiButton from "#root/components/MuiButton";
import MuiTooltip from "#root/components/MuiTooltip";

const defaultStyle = {};

interface ToolbarIconButtonProps extends ButtonProps {
    tooltipTitle?: string;
    title: string;
    handleClick: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

const MuiDataGridToolbarIconButtonComponent = ({
    tooltipTitle,
    title,
    handleClick,
    style = {},
    className: props__className = "",
    ...props
}: ToolbarIconButtonProps) => {
    return (
        <MuiTooltip //
            title={tooltipTitle}
        >
            <div //
                className={`${props?.variant === "text" ? "ml-0" : "ml-1"}`}
            >
                <MuiButton //
                    style={{
                        ...defaultStyle, //
                        ...style,
                    }}
                    className={`min-h-0 rounded px-2 py-1 text-[14px] font-semibold whitespace-nowrap ${props__className}`}
                    onClick={(e) => handleClick(e)} //
                    size="small"
                    variant="contained"
                    color="primary"
                    {...props}
                >
                    {title}
                </MuiButton>
            </div>
        </MuiTooltip>
    );
};

export default React.memo(MuiDataGridToolbarIconButtonComponent);
