const DEFAULT_MAX_FILE_SIZE_MB = 15;

export const downloadJson = (
    data: object, //
    fileName: string
) => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${fileName}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const downloadDrawioXml = (
    xmlContent: string, //
    fileName: string
) => {
    const blob = new Blob([xmlContent], { type: "application/vnd.jgraph.mxfile" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${fileName}.drawio`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

export const getFileFromFiles = (
    files: FileList, //
    MAX_FILE_SIZE_MB = DEFAULT_MAX_FILE_SIZE_MB
) => {
    const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;

    const file = Array.from(files)?.[0];

    if (!file) {
        throw new Error("No files selected.");
    }
    if (file.type !== "application/json") {
        throw new Error("Invalid file type.");
    }
    if (file.size > MAX_FILE_SIZE) {
        throw new Error(`File exceeds ${MAX_FILE_SIZE_MB}MB.`);
    }

    return file;
};

export const getFileContentFromFile = async (file: File): Promise<object | null> => {
    if (!file) return null;

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            try {
                const fileContent = reader.result; // <-- use reader.result
                if (typeof fileContent !== "string") {
                    throw new SyntaxError("FileReader.result was not a string");
                }
                resolve(JSON.parse(fileContent));
            } catch (error) {
                // eslint-disable-next-line no-console
                console.error("Error parsing JSON:", error);
                reject(error);
            }
        };
        reader.readAsText(file);
    });
};

export const downloadBase64File = (
    base64Data: string, //
    fileName: string,
    contentType = "application/octet-stream"
) => {
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

/**
 * Decodes a base64-encoded UTF-8 text payload (as returned by the backend's
 * single-file download endpoints) back into a plain string, e.g. for
 * re-importing a previously saved diagram JSON file's content without
 * triggering a browser file download.
 */
export const base64ToText = (base64Data: string): string => {
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new TextDecoder("utf-8").decode(byteArray);
};
