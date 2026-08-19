import React from "react";

import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { Stack, Typography } from "@mui/material";

import { VisuallyHiddenInput } from "#root/components";
import MuiButton from "#root/components/MuiButton";
import MuiPaper from "#root/components/MuiPaper";
import { DialogFieldComponentProps } from "#root/interfaces/dialogField";

import DialogFieldLabelWrapper from "./DialogFieldLabelWrapper";

interface DialogUploadFieldProps extends DialogFieldComponentProps {
    multiple?: boolean;
}

const DialogUploadFieldComponent = ({
    field, //
    refValues,
    disabled,
    multiple = false,
}: DialogUploadFieldProps) => {
    // Hooks
    const [selectedFiles, setSelectedFiles] = React.useState<FileList | null>({} as FileList);

    const selectedFileNames = Array.from(selectedFiles || [])?.map((f) => f?.name);
    const isComponentDisabled = !!disabled || !!field.disabled;

    const handleChangeInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        const _files = event.target.files;
        setSelectedFiles(_files);
        if (!!field.handleChange) field.handleChange(_files);
        refValues.current[field.id] = _files as FileList;
        if (!!field?.updateHiddenStates) field.updateHiddenStates();
    };

    React.useEffect(() => {
        if (!field?.required) return;
        refValues.current[field.id] = field?.defaultValue ?? {};
        if (!!field?.updateHiddenStates) field.updateHiddenStates();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <DialogFieldLabelWrapper field={field}>
            <Stack spacing={1}>
                <MuiButton
                    component="label"
                    role={undefined}
                    variant="contained"
                    tabIndex={-1}
                    startIcon={<CloudUploadIcon />}
                    disabled={!!isComponentDisabled}
                >
                    Upload
                    <VisuallyHiddenInput
                        type="file" //
                        onChange={handleChangeInput}
                        multiple={!!multiple}
                        accept={`${field?.upload_accept || ""}`}
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
        </DialogFieldLabelWrapper>
    );
};

export default DialogUploadFieldComponent;
