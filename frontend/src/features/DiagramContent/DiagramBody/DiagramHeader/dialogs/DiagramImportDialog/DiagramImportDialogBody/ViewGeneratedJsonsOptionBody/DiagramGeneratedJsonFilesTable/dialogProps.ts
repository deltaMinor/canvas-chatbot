import { useProjectId } from "#root/hooks/backendHooks";
import {
    useMuiDataGridRowSelectionModel,
    useMuiDataGridSelectedRowState,
} from "#root/hooks/muiDataGridTable";
import { GetDialogProps } from "#root/interfaces/dataGrid";
import CallApiWithSnackbar from "#root/services/CallApiWithSnackbar";
import { refreshProjectDiagramFileGeneratedJson } from "#root/stores/backendRefreshStore";

import {
    deleteProjectGeneratedJsonFileDialogConfirmStateKey,
    deleteProjectGeneratedJsonFilesDialogConfirmStateKey,
} from "./constants";
import { processClickDeleteProjectGeneratedJsonFiles } from "./helper";
import { ProjectGeneratedJsonFilesTableRefObject } from "./interface";

export const useProjectGeneratedJsonConfirmDialogProps = (_props: GetDialogProps) => {
    const project_id = useProjectId();
    const refreshGeneratedJsonFile = () => refreshProjectDiagramFileGeneratedJson();
    const selectedRow = useMuiDataGridSelectedRowState();
    const rowSelectionModel = useMuiDataGridRowSelectionModel();
    const file_id_list = Array.from(rowSelectionModel?.ids || []).map((id) => `${id || ""}`);

    const handleClickDeleteProjectGeneratedJsonFile = async () => {
        await CallApiWithSnackbar({
            async_func: async () => {
                await processClickDeleteProjectGeneratedJsonFiles(
                    {
                        project_id,
                        file_id_list: [selectedRow?.["file_id"]],
                    },
                    {}
                );
            },
            func_on_success: async () => {
                refreshGeneratedJsonFile();
            },
            message: "Deleting ...",
            messageOnSuccess: "Deleted.",
        });
    };

    const handleClickDeleteProjectGeneratedJsonFiles = async () => {
        await CallApiWithSnackbar({
            async_func: async () => {
                await processClickDeleteProjectGeneratedJsonFiles(
                    {
                        project_id,
                        file_id_list,
                    },
                    {}
                );
            },
            func_on_success: async () => {
                refreshGeneratedJsonFile();
            },
            message: "Deleting ...",
            messageOnSuccess: "Deleted.",
        });
    };

    return [
        {
            stateKey: deleteProjectGeneratedJsonFileDialogConfirmStateKey,
            message: "Are you sure you want to delete this selected generated JSON file?",
            onClick: handleClickDeleteProjectGeneratedJsonFile,
            title: "Delete Generated JSON File",
            data: [selectedRow?.["file_id"]],
        },
        {
            stateKey: deleteProjectGeneratedJsonFilesDialogConfirmStateKey,
            message: "Are you sure you want to delete these selected generated JSON file(s)?",
            onClick: handleClickDeleteProjectGeneratedJsonFiles,
            title: "Delete Generated JSON File(s)",
            data: file_id_list,
        },
    ];
};

export const getProjectGeneratedJsonFileDialogCustomProps = (_props: {
    tableRef: React.RefObject<ProjectGeneratedJsonFilesTableRefObject>;
}) => {
    return [];
};
