import { DataGridProps } from "@mui/x-data-grid";

import { initMuiDataGridTableRef } from "#root/components/MuiDataGridTable/constants";
import { ProjectDiagramFileField } from "#root/interfaces/diagramFile";
import { DialogConfirmStateEnum } from "#root/interfaces/dialog";
import { getMuiDataGridInitialState } from "#root/utils/muiDataGridTableUtils";

export const initProjectGeneratedJsonFilesTableRef = {
    ...initMuiDataGridTableRef, //
};

export const getDiagramGeneratedJsonFilesDataGridProps = ({
    isRowSelectable,
}: {
    isRowSelectable: NonNullable<DataGridProps["isRowSelectable"]>;
}) => ({
    initialState: getMuiDataGridInitialState(),
    checkboxSelection: false,
    isRowSelectable,
    localeText: {
        noRowsLabel: "No generated JSON files saved yet.",
    },
});

export const defaultVisibleFields = [
    ProjectDiagramFileField.filename, //
    ProjectDiagramFileField.timestamp,
    ProjectDiagramFileField.download,
    ProjectDiagramFileField.delete,
];

export const deleteProjectGeneratedJsonFileDialogConfirmStateKey =
    DialogConfirmStateEnum.confirmDeleteGeneratedJsonFile;
export const deleteProjectGeneratedJsonFilesDialogConfirmStateKey =
    DialogConfirmStateEnum.confirmDeleteGeneratedJsonFiles;
