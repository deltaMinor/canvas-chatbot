import { TOPOLOGY_DATABASE_FILE_TITLE } from "#root/constants/diagramChatbot";
import { IntentRXPanel } from "#root/services/domain/intentrx";

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

const DATABASE_PDF_OPTION_LINE_RE = /^\[(\d+)]\s+\S.*\.pdf\s*\(size=.*\)\s*$/i;

export const extractLastDatabasePdfIndex = (panels: IntentRXPanel[]): string | null => {
    const databasePanels = panels.filter((panel) => panel.title === TOPOLOGY_DATABASE_FILE_TITLE);
    const searchPanels = databasePanels.length > 0 ? databasePanels : panels;

    for (let i = searchPanels.length - 1; i >= 0; i--) {
        const text = searchPanels[i]?.text ?? "";
        const lines = text.split("\n");
        for (let j = lines.length - 1; j >= 0; j--) {
            const match = DATABASE_PDF_OPTION_LINE_RE.exec(lines[j]?.trim() ?? "");
            if (match?.[1]) return match[1];
        }
    }
    return null;
};
