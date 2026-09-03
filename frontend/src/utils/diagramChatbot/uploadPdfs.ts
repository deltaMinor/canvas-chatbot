import { TOPOLOGY_DATABASE_FILE_TITLE } from "#root/constants/diagramChatbot";
import { ProjectDiagramFile } from "#root/interfaces/common";
import type { ProjectDiagramFiles } from "#root/interfaces/diagramFile";
import { IntentRXPanel } from "#root/services/domain/intentrx";

export const CHATBOT_FILE_SOURCE = "chatbot";

const formatPdfTimestamp = (raw?: string): string => {
    if (!raw) return "";
    const withoutOffset = raw.replace(/([+-]\d{2}:?\d{2}|Z)$/i, "");
    const [datePart, timePart = ""] = withoutOffset.replace("T", " ").split(" ");
    const [time, fraction = ""] = timePart.split(".");
    const microseconds = fraction.padEnd(6, "0").slice(0, 6);
    return `${datePart} ${time}.${microseconds}`;
};

export const getUploadedPdfs = (projectDiagramFilePdf: ProjectDiagramFiles): ProjectDiagramFile[] =>
    (projectDiagramFilePdf?.files ?? [])
        .filter((file) => file.source !== CHATBOT_FILE_SOURCE)
        .slice()
        .sort(
            (a, b) => new Date(b.uploadDate ?? 0).getTime() - new Date(a.uploadDate ?? 0).getTime()
        );
export const fileToString = (file: ProjectDiagramFile): string =>
    `${file.filename} (size=${file.length ?? 0}, uploaded=${formatPdfTimestamp(file.uploadDate)})`;
export const filesToList = (files: ProjectDiagramFile[]): string =>
    files.map((file, index) => `[${index + 1}]` + fileToString(file)).join("\n");
export const findPrecedingIndex = (source: string, input: string): string => {
    const inputIndex = source.indexOf(input);
    if (inputIndex === -1) {
        throw new Error("Input text not found in source string");
    }

    const prefix = source.slice(0, inputIndex);

    const matches = [...prefix.matchAll(/\[(\d+)\]\s/g)];
    const lastMatch = matches.pop();

    if (!lastMatch) {
        throw new Error("No preceding [#] marker found");
    }

    const num = lastMatch[1];
    if (num === undefined) {
        throw new Error("Marker found but number capture group missing");
    }

    return num;
};

export const getIndexWithPdf = (panels: IntentRXPanel[], fileString: string): string => {
    const databasePanels = panels.filter((panel) => panel.title === TOPOLOGY_DATABASE_FILE_TITLE);
    const databaseText =
        databasePanels.length === 1 && databasePanels[0] !== undefined
            ? databasePanels[0].text
            : "";
    return findPrecedingIndex(databaseText, fileString);
};
