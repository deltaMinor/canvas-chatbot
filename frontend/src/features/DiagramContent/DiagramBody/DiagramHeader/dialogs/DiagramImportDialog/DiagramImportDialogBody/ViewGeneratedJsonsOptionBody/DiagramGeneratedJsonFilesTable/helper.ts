import { GridValidRowModel } from "@mui/x-data-grid";

import { DialogConfirmStateEnum } from "#root/enums/dialog";
import { ServiceDomainProps } from "#root/interfaces/domain";
import CallApiWithSnackbar from "#root/services/CallApiWithSnackbar";
import {
    deleteProjectDiagramFileGeneratedJson,
    renameProjectDiagramFileGeneratedJson,
} from "#root/services/domain/diagram_generated_json_file";
import { refreshProjectDiagramFileGeneratedJson } from "#root/stores/backendRefreshStore";
import { getProjectIdFromStore } from "#root/stores/backendStore";
import { handleOpenDialogConfirm } from "#root/stores/dialogStore";
import { setPendingTopologyDiagramAddress } from "#root/utils/diagramChatbot/topologyDiagramPendingStore";

export const processClickDeleteProjectGeneratedJsonFiles = async (
    {
        project_id, //
        file_id_list,
    }: {
        project_id: string;
        file_id_list: string[];
    },
    serviceDomainProps: ServiceDomainProps = {}
) => {
    await deleteProjectDiagramFileGeneratedJson(
        { project_id, file_id_list }, //
        serviceDomainProps
    );
};

export const handleClickImportGeneratedJsonFile = (file_id: string) => {
    setPendingTopologyDiagramAddress(file_id);
    handleOpenDialogConfirm(DialogConfirmStateEnum.confirmGenerateDiagramFromTopologyGenerator);
};

export const processProjectGeneratedJsonFileNameRowUpdate = async (
    newRow: GridValidRowModel, //
    oldRow: GridValidRowModel
) => {
    if (newRow.filename === oldRow.filename) return oldRow;

    const project_id = getProjectIdFromStore();

    await CallApiWithSnackbar({
        async_func: async () => {
            await renameProjectDiagramFileGeneratedJson(
                {
                    project_id,
                    file_id: oldRow.file_id,
                    filename: newRow.filename,
                },
                {}
            );
        },
        func_on_success: async () => {
            await refreshProjectDiagramFileGeneratedJson();
        },
        message: "Renaming ...",
        messageOnSuccess: "Renamed.",
        propagateError: true,
    });

    return newRow;
};
