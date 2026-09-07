import { DataGridProps } from "@mui/x-data-grid";

import { initMuiDataGridTableRef } from "#root/components/MuiDataGridTable/constants";
import { ProjectDiagramFileField } from "#root/interfaces/diagramFile";
import { DialogConfirmStateEnum } from "#root/interfaces/dialog";
import { getMuiDataGridInitialState } from "#root/utils/muiDataGridTableUtils";

import { processProjectPdfFileNameRowUpdate } from "./helper";

export const initProjectPdfFilesTableRef = {
    ...initMuiDataGridTableRef, //
};

export const getDiagramPdfFilesDataGridProps = ({
    isRowSelectable,
}: {
    isRowSelectable: NonNullable<DataGridProps["isRowSelectable"]>;
}) => ({
    initialState: getMuiDataGridInitialState(),
    checkboxSelection: false,
    isRowSelectable,
    localeText: {
        noRowsLabel: "No PDF files uploaded.",
    },
    processRowUpdate: processProjectPdfFileNameRowUpdate,
    onProcessRowUpdateError: () => {}, // Errors are already surfaced via a snackbar in processProjectPdfFileNameRowUpdate.
});

export const defaultVisibleFields = [
    ProjectDiagramFileField.filename, //
    ProjectDiagramFileField.timestamp,
    ProjectDiagramFileField.download,
    ProjectDiagramFileField.delete,
];

export const deleteProjectPdfFileDialogConfirmStateKey =
    DialogConfirmStateEnum.confirmDeletePdfFile;
export const deleteProjectPdfFilesDialogConfirmStateKey =
    DialogConfirmStateEnum.confirmDeletePdfFiles;
