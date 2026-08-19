import React from "react";

import { Button, Dialog, DialogContent, DialogTitle } from "@mui/material";

export interface UploadDirectoryDialogProps {
    open: boolean;
    handleCloseDialog: () => void;
    handleUpload: (f: FileList, s: string) => Promise<void>;
    //
    accept?: string;
    inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
    title?: string;
}

const UploadDirectoryDialogComponent = ({
    open,
    handleCloseDialog,
    handleUpload,
    inputProps,
    title,
}: UploadDirectoryDialogProps) => {
    // Hooks
    const [files, setFiles] = React.useState<FileList>();
    const [directoryName, setDirectoryName] = React.useState<string>("");

    const handleChangeInput = React.useCallback(
        async (event: React.ChangeEvent<HTMLInputElement>) => {
            const files = event?.target?.files || ({} as FileList);
            if (!Object.keys(files)?.length) return;
            setFiles(files);
            setDirectoryName(files[0]?.webkitRelativePath.split("/")[0] + ".zip"); // Use the directory as the zip file name
        },
        []
    );

    const handleClickUpload = React.useCallback(async () => {
        handleCloseDialog();
        if (!files || !handleUpload) return;
        await handleUpload(files, directoryName);
    }, [
        directoryName, //
        files,
        handleCloseDialog,
        handleUpload,
    ]);

    return (
        <Dialog
            open={!!open} //
            onClose={() => handleCloseDialog()}
        >
            <DialogTitle>{title || "Upload Directory"}</DialogTitle>
            <DialogContent>
                <input
                    id="directory"
                    type="file" //
                    multiple
                    onChange={handleChangeInput}
                    // directory=""
                    // webkitdirectory=""
                    {...(inputProps || {})}
                />
            </DialogContent>
            <Button onClick={handleClickUpload}>Upload</Button>
        </Dialog>
    );
};

export default React.memo(UploadDirectoryDialogComponent);
