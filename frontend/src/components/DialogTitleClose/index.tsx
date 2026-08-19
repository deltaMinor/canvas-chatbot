import React from "react";

import CloseIcon from "@mui/icons-material/Close";
import { DialogTitle, IconButton } from "@mui/material";

interface DialogTitleCloseProps {
    handleClose: () => void;
}

const DialogTitleCloseComponent = ({
    handleClose, //
}: DialogTitleCloseProps) => {
    return (
        <DialogTitle id="dialog_title_top">
            <IconButton
                aria-label="close"
                onClick={handleClose}
                sx={{
                    position: "absolute",
                    right: 8,
                    top: 8,
                    color: (theme) => theme.palette.grey[500],
                }}
            >
                <CloseIcon />
            </IconButton>
        </DialogTitle>
    );
};

export default React.memo(DialogTitleCloseComponent);
