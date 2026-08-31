import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";

import MuiButton from "#root/components/MuiButton";
import { ProjectDiagramFileField } from "#root/interfaces/diagramFile";
import { handleOpenDialog } from "#root/stores/dialogStore";
import { setMuiDataGridSelectedRowId } from "#root/stores/muiDataGridStore";
import { convertTimezoneToSGT } from "#root/utils/genericHelper";

import { deleteProjectPdfFileDialogConfirmStateKey } from "./constants";
import { handleClickDownloadPdfFile } from "./helper";
import { ProjectPdfFilesTableRefObject } from "./interface";
import { getProjectPdfFileRowIdFromRow } from "./rows";

export const getProjectPdfFilesTableColumns = ({
    tableRef: _tableRef,
    muiDataGridTableInstanceId,
}: {
    tableRef: React.RefObject<ProjectPdfFilesTableRefObject>;
    muiDataGridTableInstanceId: string;
}) => {
    const handleClickDelete = async (
        _event: React.MouseEvent<HTMLButtonElement, MouseEvent>, //
        params: GridRenderCellParams
    ) => {
        const row_id = getProjectPdfFileRowIdFromRow({
            row: params.row,
            muiDataGridTableInstanceId,
        });
        setMuiDataGridSelectedRowId(row_id, muiDataGridTableInstanceId);
        handleOpenDialog(deleteProjectPdfFileDialogConfirmStateKey);
    };

    const handleClickDownload = async (
        _event: React.MouseEvent<HTMLButtonElement, MouseEvent>, //
        params: GridRenderCellParams
    ) => {
        const row_id = getProjectPdfFileRowIdFromRow({
            row: params.row,
            muiDataGridTableInstanceId,
        });
        await handleClickDownloadPdfFile(row_id);
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
            headerName: "Download",
            headerAlign: "center",
            align: "center",
            renderCell: (params) => {
                return (
                    <MuiButton
                        onClick={(ev) => handleClickDownload(ev, params)} //
                        color="primary"
                        startIcon={<DownloadIcon />}
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
