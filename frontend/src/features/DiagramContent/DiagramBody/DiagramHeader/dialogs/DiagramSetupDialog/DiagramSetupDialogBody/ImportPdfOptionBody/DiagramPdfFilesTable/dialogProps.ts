import { useProjectId } from "#root/hooks/backendHooks";
import {
    useMuiDataGridRowSelectionModel,
    useMuiDataGridSelectedRowState,
} from "#root/hooks/muiDataGridTable";
import { GetDialogProps } from "#root/interfaces/dataGrid";
import CallApiWithSnackbar from "#root/services/CallApiWithSnackbar";
import { refreshProjectDiagramFilePdf } from "#root/stores/backendRefreshStore";

import {
    deleteProjectPdfFileDialogConfirmStateKey,
    deleteProjectPdfFilesDialogConfirmStateKey,
} from "./constants";
import { processClickDeleteProjectPdfFiles } from "./helper";
import { ProjectPdfFilesTableRefObject } from "./interface";

export const useProjectPdfConfirmDialogProps = (_props: GetDialogProps) => {
    const project_id = useProjectId();
    const refreshPdfFile = () => refreshProjectDiagramFilePdf();
    const selectedRow = useMuiDataGridSelectedRowState();
    const rowSelectionModel = useMuiDataGridRowSelectionModel();
    const file_id_list = Array.from(rowSelectionModel?.ids || []).map((id) => `${id || ""}`);

    const handleClickDeleteProjectPdfFile = async () => {
        await CallApiWithSnackbar({
            async_func: async () => {
                await processClickDeleteProjectPdfFiles(
                    {
                        project_id,
                        file_id_list: [selectedRow?.["file_id"]],
                    },
                    {}
                );
            },
            func_on_success: async () => {
                refreshPdfFile();
            },
            message: "Deleting ...",
            messageOnSuccess: "Deleted.",
        });
    };

    const handleClickDeleteProjectPdfFiles = async () => {
        await CallApiWithSnackbar({
            async_func: async () => {
                await processClickDeleteProjectPdfFiles(
                    {
                        project_id,
                        file_id_list,
                    },
                    {}
                );
            },
            func_on_success: async () => {
                refreshPdfFile();
            },
            message: "Deleting ...",
            messageOnSuccess: "Deleted.",
        });
    };

    return [
        {
            stateKey: deleteProjectPdfFileDialogConfirmStateKey,
            message: "Are you sure you want to delete this selected PDF file?",
            onClick: handleClickDeleteProjectPdfFile,
            title: "Delete Project PDF File",
            data: [selectedRow?.["file_id"]],
        },
        {
            stateKey: deleteProjectPdfFilesDialogConfirmStateKey,
            message: "Are you sure you want to delete these selected PDF file(s)?",
            onClick: handleClickDeleteProjectPdfFiles,
            title: "Delete Project PDF File(s)",
            data: file_id_list,
        },
    ];
};

export const getProjectPdfFileDialogCustomProps = (_props: {
    tableRef: React.RefObject<ProjectPdfFilesTableRefObject>;
}) => {
    return [];
};
