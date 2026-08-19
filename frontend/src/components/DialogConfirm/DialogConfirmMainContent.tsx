import React from "react";

import { Alert, DialogContent, DialogContentText, Stack } from "@mui/material";

import MuiDialogTitle from "#root/components/MuiDialogTitle";
import { ConfirmDialogProps } from "#root/interfaces/dialogConfirm";

import DialogConfirmDataList from "./DialogConfirmDataList";

interface DialogConfirmMainContentProps {
    prop: ConfirmDialogProps;
}

const DialogConfirmMainContent = ({ prop }: DialogConfirmMainContentProps) => {
    return (
        <>
            <MuiDialogTitle title={`${prop?.title || ""}`} />
            <DialogContent>
                <Stack
                    className="w-full"
                    spacing={1}
                >
                    {prop?.topComponent}
                    <DialogContentText>{prop?.message}</DialogContentText>
                    {!!prop?.data?.length && <DialogConfirmDataList data={prop.data} />}
                    {!!prop?.getDataFunc && <DialogConfirmDataList data={prop.getDataFunc()} />}
                    {!!prop?.warningMessage && (
                        <Alert
                            variant="outlined"
                            severity="warning"
                        >
                            {prop.warningMessage}
                        </Alert>
                    )}
                    {prop?.additionalComponent}
                </Stack>
            </DialogContent>
        </>
    );
};

export default React.memo(DialogConfirmMainContent);
