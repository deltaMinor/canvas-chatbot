import DeleteIcon from "@mui/icons-material/Delete";
import SaveAlt from "@mui/icons-material/SaveAlt";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";

import EditableFilenameCell, {
    preProcessFilenameEditCellProps,
} from "#root/components/EditableFilenameCell";
import MuiButton from "#root/components/MuiButton";
import { ProjectDiagramFileField } from "#root/interfaces/diagramFile";
import { handleOpenDialog } from "#root/stores/dialogStore";
import { setMuiDataGridSelectedRowId } from "#root/stores/muiDataGridStore";
import { convertTimezoneToSGT } from "#root/utils/genericHelper";

import { deleteProjectGeneratedJsonFileDialogConfirmStateKey } from "./constants";
import { handleClickImportGeneratedJsonFile } from "./helper";
import { ProjectGeneratedJsonFilesTableRefObject } from "./interface";
import { getProjectGeneratedJsonFileRowIdFromRow } from "./rows";

export const getProjectGeneratedJsonFilesTableColumns = ({
    tableRef: _tableRef,
    muiDataGridTableInstanceId,
}: {
    tableRef: React.RefObject<ProjectGeneratedJsonFilesTableRefObject>;
    muiDataGridTableInstanceId: string;
}) => {
    const handleClickDelete = async (
        _event: React.MouseEvent<HTMLButtonElement, MouseEvent>, //
        params: GridRenderCellParams
    ) => {
        const row_id = getProjectGeneratedJsonFileRowIdFromRow({
            row: params.row,
            muiDataGridTableInstanceId,
        });
        setMuiDataGridSelectedRowId(row_id, muiDataGridTableInstanceId);
        handleOpenDialog(deleteProjectGeneratedJsonFileDialogConfirmStateKey);
    };

    const handleClickImport = (
        _event: React.MouseEvent<HTMLButtonElement, MouseEvent>, //
        params: GridRenderCellParams
    ) => {
        const row_id = getProjectGeneratedJsonFileRowIdFromRow({
            row: params.row,
            muiDataGridTableInstanceId,
        });
        handleClickImportGeneratedJsonFile(row_id);
    };

    return [
        {
            field: ProjectDiagramFileField.file_id,
            headerName: "ID", //
        },
        {
            field: ProjectDiagramFileField.filename,
            headerName: "File Name", //
            flex: 1,
            editable: true,
            renderEditCell: (params) => <EditableFilenameCell {...params} />,
            preProcessEditCellProps: preProcessFilenameEditCellProps,
        },
        {
            field: ProjectDiagramFileField.timestamp,
            headerName: "Uploaded On",
            headerAlign: "center",
            align: "center",
            valueGetter: (value, _row, _column, _apiRef) => {
                return convertTimezoneToSGT(value);
            },
        },
        {
            field: ProjectDiagramFileField.download,
            headerName: "Import",
            headerAlign: "center",
            align: "center",
            renderCell: (params) => {
                return (
                    <MuiButton
                        onClick={(ev) => handleClickImport(ev, params)} //
                        color="primary"
                        startIcon={<SaveAlt />}
                    />
                );
            },
        },
        {
            field: ProjectDiagramFileField.delete,
            headerName: "Delete",
            headerAlign: "center",
            align: "center",
            renderCell: (params) => {
                return (
                    <MuiButton
                        onClick={(ev) => handleClickDelete(ev, params)} //
                        color="error"
                        startIcon={<DeleteIcon />}
                    />
                );
            },
        },
    ] as GridColDef[];
};
