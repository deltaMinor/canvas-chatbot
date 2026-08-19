import { useState } from "react";

export const useFileAttachments = () => {
    const [pendingFiles, setPendingFiles] = useState<File[]>([]);

    const stageFiles = (incoming: FileList | null) => {
        if (!incoming || incoming.length == 0) return;

        setPendingFiles((prev) => {
            const existing = new Set(prev.map((f) => f.name));

            const newFiles = Array.from(incoming).filter((f) => !existing.has(f.name));

            return [...prev, ...newFiles];
        });
    };

    const removeFile = (index: number) => {
        setPendingFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const clearFiles = () => {
        setPendingFiles([]);
    };

    return {
        pendingFiles,
        stageFiles,
        removeFile,
        clearFiles,
    };
};
