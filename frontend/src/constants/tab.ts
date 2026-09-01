const manageFilesProjectPdfTabList = ["PDF"];
export const manageFilesProjectPdfTabLabelProperties =
    manageFilesProjectPdfTabList?.map((label) => {
        return { label };
    }) || [];

const manageFilesProjectGeneratedJsonTabList = ["Generated JSON"];
export const manageFilesProjectGeneratedJsonTabLabelProperties =
    manageFilesProjectGeneratedJsonTabList?.map((label) => {
        return { label };
    }) || [];

export const MAX_FILE_COUNT = 5;
export const MAX_FILE_SIZE_MB = 5;
