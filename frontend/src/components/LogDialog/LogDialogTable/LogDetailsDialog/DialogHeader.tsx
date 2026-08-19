import React from "react";

import { DialogTitle, Typography } from "@mui/material";

interface DialogHeaderProps {
    title: string;
}

const titleStyles: SxProps<Theme> = {
    fontWeight: 700,
    fontSize: "1.25rem",
    letterSpacing: "-0.01em",
    color: "text.primary",
    lineHeight: 1.4,
};

const DialogHeader: React.FC<DialogHeaderProps> = ({ title }) => {
    return (
        <DialogTitle sx={{ pb: 2 }}>
            <Typography
                variant="h6"
                component="div"
                sx={titleStyles}
            >
                {title}
            </Typography>
        </DialogTitle>
    );
};

export default React.memo(DialogHeader);
