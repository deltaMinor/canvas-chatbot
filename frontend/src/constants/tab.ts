const manageFilesIaCTabList = ["Terraform", "Module Directory"];
export const manageFilesIaCTabLabelProperties =
    manageFilesIaCTabList?.map((label) => {
        return { label };
    }) || [];

const manageFilesCactiTabList = ["CACTi"];
export const manageFilesCactiTabLabelProperties =
    manageFilesCactiTabList?.map((label) => {
        return { label };
    }) || [];

const manageFilesProjectDiagramTabList = ["JSON"];
export const manageFilesProjectDiagramTabLabelProperties =
    manageFilesProjectDiagramTabList?.map((label) => {
        return { label };
    }) || [];

export const manageFilesXMLTabList = ["XML"];
export const manageFilesXMLTabLabelProperties =
    manageFilesXMLTabList?.map((label) => {
        return { label };
    }) || [];

const manageFilesProjectPdfTabList = ["PDF"];
export const manageFilesProjectPdfTabLabelProperties =
    manageFilesProjectPdfTabList?.map((label) => {
        return { label };
    }) || [];

export const MAX_FILE_COUNT = 5;
export const MAX_FILE_SIZE_MB = 5;
