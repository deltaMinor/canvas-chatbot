import { MAX_FILE_COUNT, MAX_FILE_SIZE_MB } from "#root/constants/tab";
import { ServiceDomainProps } from "#root/interfaces/domain";
import { FileUploadFactory } from "#root/lib/upload";
import CallApiWithSnackbar from "#root/services/CallApiWithSnackbar";
import { deleteProjectDiagramFilePdf } from "#root/services/domain/diagram_pdf_file";
import { refreshProjectDiagramFilePdf } from "#root/stores/backendRefreshStore";
import {
    getProjectDiagramFilePdfFromStore,
    getProjectIdFromStore,
} from "#root/stores/backendStore";

const validateProjectPdfFiles = (files: FileList) => {
    const nextFiles = Array.from(files);
    const maxFileSize = MAX_FILE_SIZE_MB * 1024 * 1024;
    const existingFileCount = getProjectDiagramFilePdfFromStore()?.files?.length ?? 0;

    if (existingFileCount + nextFiles.length > MAX_FILE_COUNT) {
        throw new Error(`Upload limit exceeded. Maximum ${MAX_FILE_COUNT} files allowed.`);
    }

    nextFiles.forEach((file) => {
        if (file.size > maxFileSize) {
            throw new Error(`File exceeds ${MAX_FILE_SIZE_MB}MB.`);
        }
    });
};

export const processClickDeleteProjectPdfFiles = async (
    {
        project_id, //
        file_id_list,
    }: {
        project_id: string;
        file_id_list: string[];
    },
    serviceDomainProps: ServiceDomainProps = {}
) => {
    await deleteProjectDiagramFilePdf(
        { project_id, file_id_list }, //
        serviceDomainProps
    );
};

export const processClickUploadProjectPdfFile = async (
    {
        project_id, //
        files,
    }: {
        project_id: string;
        files?: FileList;
    },
    serviceDomainProps: ServiceDomainProps = {}
) => {
    if (!files) throw new Error("No file found.");
    validateProjectPdfFiles(files);

    const fileUploadFactory = new FileUploadFactory(project_id);
    await fileUploadFactory.postDiagramPdfFile(
        files, //
        serviceDomainProps
    );
};

export const handleClickUploadPdfFile = async (files?: FileList) => {
    if (!files) return;

    const project_id = getProjectIdFromStore();

    await CallApiWithSnackbar({
        async_func: async () => {
            await processClickUploadProjectPdfFile(
                {
                    project_id,
                    files,
                },
                {}
            );
        },
        func_on_success: async () => {
            await refreshProjectDiagramFilePdf();
        },
        message: "Saving ...",
        messageOnSuccess: "Saved.",
        disableMessageOnError: true,
    });
};
