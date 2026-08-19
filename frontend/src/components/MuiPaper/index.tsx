import React from "react";

import { Paper, PaperProps } from "@mui/material";

const defaultStyle = {};

interface MuiPaperProps extends PaperProps {}

const MuiPaperComponent = ({
    children, //
    style,
    className: props__className = "",
    ...props
}: MuiPaperProps) => {
    return (
        <Paper
            style={{
                ...defaultStyle, //
                ...style,
            }}
            className={`rounded px-2 py-1 shadow-none ${props__className}`}
            variant="outlined"
            {...props} //
        >
            {children}
        </Paper>
    );
};

export default React.memo(MuiPaperComponent);
