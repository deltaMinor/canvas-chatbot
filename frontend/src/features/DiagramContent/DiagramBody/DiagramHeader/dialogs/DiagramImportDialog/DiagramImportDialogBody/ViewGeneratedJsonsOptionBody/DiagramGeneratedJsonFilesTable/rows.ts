import { ProjectDiagramFile } from "#root/interfaces/common";
import { MuiDataGridTableGetRowIdFromRowProps } from "#root/interfaces/muiDataGridTable";

export const getProjectGeneratedJsonFileRowIdFromRow = ({
    row,
}: MuiDataGridTableGetRowIdFromRowProps) => {
    return row["file_id"] || "";
};

export const getProjectGeneratedJsonFileInitRows = ({
    refRows,
}: {
    refRows: ProjectDiagramFile[];
}) => {
    return (
        refRows?.map((row) => ({
            ...row,
            id: getProjectGeneratedJsonFileRowIdFromRow({
                row,
                muiDataGridTableInstanceId: "",
            }),
        })) || []
    );
};
