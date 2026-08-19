import React from "react";

import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
} from "@mui/material";

import { useDialogState } from "#root/hooks/dialogHooks";
import { DialogConfirmStateEnum } from "#root/interfaces/dialog";
import { handleCloseDialogAsync } from "#root/stores/dialogStore";
import { colors } from "#root/theme/PureLightTheme";

const RequestToFillRequiredFieldsDialogComponent = () => {
    const dialogConfirmState = useDialogState();

    const handleCloseRequestToFillRequiredFieldsDialogConfirm = React.useCallback(async () => {
        await handleCloseDialogAsync(DialogConfirmStateEnum.requestToFillRequiredFields);
    }, []);

    return (
        <Dialog
            key={DialogConfirmStateEnum.requestToFillRequiredFields}
            open={!!dialogConfirmState["requestToFillRequiredFields"]}
            onClose={handleCloseRequestToFillRequiredFieldsDialogConfirm}
            maxWidth="xs"
            sx={{ "& .MuiDialog-paper": { width: "80%" } }}
        >
            <DialogTitle>Required Fields</DialogTitle>
            <DialogContent>
                <DialogContentText //
                    className="mb-1"
                >
                    Please provide the following fields.
                </DialogContentText>
                <Box
                    className="h-full p-1" //
                    sx={{
                        backgroundColor: colors.alpha.black[5],
                    }}
                >
                    Label
                </Box>
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={handleCloseRequestToFillRequiredFieldsDialogConfirm}
                    autoFocus
                >
                    Ok
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default RequestToFillRequiredFieldsDialogComponent;
