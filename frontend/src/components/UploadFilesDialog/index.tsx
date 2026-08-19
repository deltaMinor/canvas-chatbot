import React from "react";

import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { DialogActions, DialogContent, Stack, Typography } from "@mui/material";

import MuiButton from "#root/components/MuiButton";
import MuiDialog from "#root/components/MuiDialog";
import MuiDialogTitle from "#root/components/MuiDialogTitle";
import MuiPaper from "#root/components/MuiPaper";
import VisuallyHiddenInput from "#root/components/VisuallyHiddenInput";

export interface UploadFilesDialogProps {
    open: boolean;
    handleCloseDialog: () => void;
    handleUpload: (f: FileList) => Promise<void>;
    //
    accept?: string;
    inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
    multiple?: boolean;
    title?: string;
}

const UploadFilesDialogComponent = ({
    accept,
    open,
    handleCloseDialog,
    handleUpload,
    inputProps,
    multiple,
    title,
}: UploadFilesDialogProps) => {
    // Hooks
    const [files, setFiles] = React.useState<FileList>();

    const selectedFileNames = Array.from(files || [])?.map((f) => f?.name);

    const handleChange = React.useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event?.target?.files || ({} as FileList);
        if (!Object.keys(files)?.length) return;
        setFiles(files);
    }, []);

    const handleClick = React.useCallback(async () => {
        handleCloseDialog();
        if (!files || !handleUpload) return;
        await handleUpload(files);
    }, [files, handleCloseDialog, handleUpload]);

    return (
        <MuiDialog
            open={!!open} //
            onClose={() => handleCloseDialog()}
            maxWidth={"xs"}
            fullWidth
        >
            <MuiDialogTitle //
                title={`${title || "Upload Files"}`}
            ></MuiDialogTitle>
            <DialogContent>
                <Stack spacing={1}>
                    <MuiButton
                        component="label"
                        role={undefined}
                        variant="contained"
                        tabIndex={-1}
                        startIcon={<CloudUploadIcon />}
                    >
                        Upload
                        <VisuallyHiddenInput
                            type="file" //
                            multiple={multiple ?? true}
                            onChange={handleChange}
                            accept={accept}
                            {...(inputProps || {})}
                        />
                    </MuiButton>
                    {!!selectedFileNames?.length && (
                        <MuiPaper>
                            {selectedFileNames?.map((n, nIdx) => {
                                return (
                                    <Typography
                                        key={nIdx} //
                                    >
                                        {n}
                                    </Typography>
                                );
                            })}
                        </MuiPaper>
                    )}
                </Stack>
            </DialogContent>
            <DialogActions>
                <Stack
                    direction="row"
                    spacing={1}
                >
                    <MuiButton
                        onClick={handleCloseDialog} //
                    >
                        Cancel
                    </MuiButton>
                    <MuiButton
                        onClick={handleClick} //
                        disabled={!files?.length}
                    >
                        Save
                    </MuiButton>
                </Stack>
            </DialogActions>
        </MuiDialog>
    );
};

export default React.memo(UploadFilesDialogComponent);
