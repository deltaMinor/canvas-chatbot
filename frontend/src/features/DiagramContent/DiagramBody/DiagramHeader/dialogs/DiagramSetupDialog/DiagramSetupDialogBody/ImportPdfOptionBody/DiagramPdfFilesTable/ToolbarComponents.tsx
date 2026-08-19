import DeleteIcon from "@mui/icons-material/Delete";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import { Alert } from "@mui/material";
import { GridValidRowModel } from "@mui/x-data-grid";

import MuiDataGridToolbarIconButton from "#root/components/MuiDataGridToolbarIconButton";
import { MAX_FILE_COUNT } from "#root/constants/tab";
import { useDiagramCapabilitiesState } from "#root/hooks/diagram";
import {
    MuiFilterButtonStateProps,
    MuiFilterButtonValueProps,
} from "#root/interfaces/muiDataGridTable";
import { getProjectDiagramFilePdfFromStore } from "#root/stores/backendStore";
import { handleOpenDialog } from "#root/stores/dialogStore";

import { deleteProjectPdfFilesDialogConfirmStateKey } from "./constants";
import { handleClickUploadPdfFile } from "./helper";
import { ProjectPdfFilesTableRefObject } from "./interface";

export const useProjectPdfFileToolbarComponents = (_props: {
    rows: GridValidRowModel[]; //
    filterButtonState: MuiFilterButtonStateProps;
    filterButtonValues: MuiFilterButtonValueProps;
    tableRef: React.RefObject<ProjectPdfFilesTableRefObject>;
}) => {
    const capabilities = useDiagramCapabilitiesState();
    const projectDiagramFilePdf = getProjectDiagramFilePdfFromStore();

    const shouldDisableUpload = (projectDiagramFilePdf?.files?.length ?? 0) >= MAX_FILE_COUNT;

    const handleClickUpload = async () => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".pdf";
        input.multiple = true;

        input.onchange = async () => {
            await handleClickUploadPdfFile(input.files ?? undefined);
            input.remove();
        };

        input.click();
    };

    return (
        <>
            <MuiDataGridToolbarIconButton
                tooltipTitle="Upload PDF File"
                title="Upload"
                color="primary"
                startIcon={<FileUploadIcon />}
                handleClick={() => handleClickUpload()}
                disabled={
                    !!shouldDisableUpload || !capabilities.toolbar.uploadPdfFileCreate.enabled
                }
            />
            {!!shouldDisableUpload && (
                <Alert //
                    severity="info"
                    style={{ marginLeft: "12px" }}
                >
                    Maximum number of files has been reached.
                </Alert>
            )}
        </>
    );
};

export const useProjectPdfFileSelectedToolbarComponents = (_props: {
    rows: GridValidRowModel[]; //
    filterButtonState: MuiFilterButtonStateProps;
    filterButtonValues: MuiFilterButtonValueProps;
    tableRef: React.RefObject<ProjectPdfFilesTableRefObject>;
}) => {
    const capabilities = useDiagramCapabilitiesState();

    const handleClickDelete = async () => {
        handleOpenDialog(deleteProjectPdfFilesDialogConfirmStateKey);
    };

    return (
        <MuiDataGridToolbarIconButton
            tooltipTitle="Delete Existing Project PDF File"
            title="Delete"
            color="error"
            startIcon={<DeleteIcon />}
            handleClick={() => handleClickDelete()}
            disabled={!capabilities.toolbar.uploadPdfFileDelete.enabled}
        />
    );
};
