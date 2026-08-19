import React from "react";

import { DialogActions, DialogContent, Stack, Typography } from "@mui/material";

import MuiButton from "#root/components/MuiButton";
import MuiDialog from "#root/components/MuiDialog";
import MuiDialogTitle from "#root/components/MuiDialogTitle";
import { WarningMessage } from "#root/interfaces/diagram";

import DialogContentBody from "./DialogContentBody";

interface WarningFabDialogProps {
    open: boolean;
    warningList: WarningMessage[];
    handleClose: () => void;
}

const WarningFabDialogComponent = ({ open, warningList, handleClose }: WarningFabDialogProps) => {
    return (
        <MuiDialog
            id="WarningFabDialogComponent"
            open={open}
            onClose={handleClose}
            fullWidth
            maxWidth="md"
            scroll="paper"
            disableEnforceFocus // Allows other things to take focus
            hideBackdrop // Hides the shaded backdrop
            className="w-[600px]"
            slotProps={{
                paper: {
                    className: "h-[90vh]",
                },
            }}
        >
            <MuiDialogTitle //
                title="Warnings"
            />
            <DialogContent sx={{ height: "80%" }}>
                <DialogContentBody warningList={warningList} />
            </DialogContent>
            <DialogContent>
                <Stack spacing={2}>
                    <Typography //
                    >
                        There are {warningList.filter((w) => w.isHidden)?.length} hidden items
                    </Typography>
                </Stack>
            </DialogContent>
            <DialogActions>
                <MuiButton onClick={handleClose}>Close</MuiButton>
            </DialogActions>
        </MuiDialog>
    );
};

export default React.memo(WarningFabDialogComponent);
