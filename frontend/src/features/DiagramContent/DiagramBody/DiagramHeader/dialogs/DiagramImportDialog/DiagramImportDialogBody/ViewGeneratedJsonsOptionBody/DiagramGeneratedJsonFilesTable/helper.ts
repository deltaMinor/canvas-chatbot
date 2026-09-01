import { ServiceDomainProps } from "#root/interfaces/domain";
import CallApiWithSnackbar from "#root/services/CallApiWithSnackbar";
import {
    deleteProjectDiagramFileGeneratedJson,
    downloadProjectDiagramFileGeneratedJson,
} from "#root/services/domain/diagram_generated_json_file";
import { getProjectIdFromStore } from "#root/stores/backendStore";

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

export const handleClickDownloadGeneratedJsonFile = async (file_id: string) => {
    const project_id = getProjectIdFromStore();

    await CallApiWithSnackbar({
        async_func: async () => {
            await downloadProjectDiagramFileGeneratedJson(
                { project_id, file_id }, //
                {}
            );
        },
        message: "Downloading ...",
        messageOnSuccess: "Downloaded.",
        disableMessageOnError: true,
    });
};
