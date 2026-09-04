import { TOPOLOGY_DATABASE_FILE_TITLE } from "#root/constants/diagramChatbot";
import { postDiagramPdfFiles } from "#root/services/domain/diagram_pdf_file";
import { IntentRXPanel } from "#root/services/domain/intentrx";
import { refreshProjectDiagramFilePdf } from "#root/stores/backendRefreshStore";
import { CHATBOT_FILE_SOURCE } from "#root/utils/diagramChatbot/uploadPdfs";

export interface TopologyPdfUploadResult {
    success: boolean;
    message?: string;
}

const isPdfFile = (file: File): boolean => {
    const hasPdfExtension = file.name.toLowerCase().endsWith(".pdf");
    const hasPdfMimeType = file.type === "" || file.type.toLowerCase() === "application/pdf";
    return hasPdfExtension && hasPdfMimeType;
};

export const validatePdf = (files: File[]): TopologyPdfUploadResult => {
    if (files.length !== 1) return { success: false, message: "Please upload only one file." };

    const file = files[0];
    if (!file || !isPdfFile(file))
        return { success: false, message: "Please upload a valid PDF file." };
    else return { success: true };
};

export const uploadTopologySetupPdf = async (
    file: File,
    projectId: string
): Promise<TopologyPdfUploadResult> => {
    try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("project_id", projectId);
        formData.append("source", CHATBOT_FILE_SOURCE);

        await postDiagramPdfFiles(formData);
        await refreshProjectDiagramFilePdf();

        return { success: true };
    } catch {
        return {
            success: false,
            message: "Failed to save the uploaded PDF file. Please try again.",
        };
    }
};

const DATABASE_PDF_OPTION_LINE_RE = /^\[(\d+)]\s+\S.*\.pdf\s*\(size=.*\)\s*$/i;

export const extractLastDatabasePdfIndex = (panels: IntentRXPanel[]): string | null => {
    const databasePanels = panels.filter((panel) => panel.title === TOPOLOGY_DATABASE_FILE_TITLE);
    const searchPanels = databasePanels.length > 0 ? databasePanels : panels;

    for (let i = searchPanels.length - 1; i >= 0; i--) {
        const text = searchPanels[i]?.text ?? "";
        console.log(text);
        const lines = text.split("\n");
        for (let j = 0; j < lines.length; j++) {
            const match = DATABASE_PDF_OPTION_LINE_RE.exec(lines[j]?.trim() ?? "");
            if (match?.[1]) return match[1];
        }
    }
    return null;
};

const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const extractDatabasePdfFileNameFromPanelText = (
    panelText: string,
    index: string
): string | null => {
    if (!index) return null;
    const linePattern = new RegExp(
        `^\\[${escapeRegExp(index)}]\\s+(\\S.*?)\\.pdf\\s*\\(.*\\)\\s*$`,
        "i"
    );

    for (const rawLine of panelText.split("\n")) {
        const match = linePattern.exec(rawLine.trim());
        if (match?.[1]) return match[1].trim();
    }
    return null;
};
