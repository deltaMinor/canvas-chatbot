import { ProjectDiagramFile } from "#root/interfaces/common";
import { MuiDataGridTableGetRowIdFromRowProps } from "#root/interfaces/muiDataGridTable";

export const getProjectPdfFileRowIdFromRow = ({ row }: MuiDataGridTableGetRowIdFromRowProps) => {
    return row["file_id"] || "";
};

export const getProjectPdfFileInitRows = ({ refRows }: { refRows: ProjectDiagramFile[] }) => {
    return (
        refRows?.map((row) => ({
            ...row,
            id: getProjectPdfFileRowIdFromRow({
                row,
                muiDataGridTableInstanceId: "",
            }),
        })) || []
    );
};
