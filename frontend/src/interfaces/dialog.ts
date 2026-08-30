const getInitDialogState: (keys: DialogStateEnumKeys[]) => DialogState = (keys) => {
    const initState = {} as { [key in DialogStateEnumKeys]: boolean };
    if (!keys?.length) return initState;
    keys.forEach((key: string) => {
        initState[key as keyof typeof initState] = false;
    });
    return initState;
};

const getInitDialogFieldState: (keys: DialogFieldStateEnumKeys[]) => DialogFieldState = (keys) => {
    const initState = {} as { [key in DialogFieldStateEnumKeys]: boolean };
    if (!keys?.length) return initState;
    keys.forEach((key: string) => {
        initState[key as keyof typeof initState] = false;
    });
    return initState;
};

const getInitDialogConfirmState: (keys: DialogConfirmStateEnumKeys[]) => DialogConfirmState = (
    keys
) => {
    const initState = {} as { [key in DialogConfirmStateEnumKeys]: boolean };
    if (!keys?.length) return initState;
    keys.forEach((key: string) => {
        initState[key as keyof typeof initState] = false;
    });
    return initState;
};

const getInitLogDialogState: (keys: LogDialogStateEnumKeys[]) => LogDialogState = (keys) => {
    const initState = {} as { [key in LogDialogStateEnumKeys]: boolean };
    if (!keys?.length) return initState;
    keys.forEach((key: string) => {
        initState[key as keyof typeof initState] = false;
    });
    return initState;
};

export enum DialogStateEnum {
    addRegisterScenario = "addRegisterScenario",
    addMasterRegisterScenario = "addMasterRegisterScenario",
    addProjectRegisterScenario = "addProjectRegisterScenario",
    addRegister = "addRegister",
    appVersionInfo = "appVersionInfo",
    assessmentCheckpointHistory = "assessmentCheckpointHistory",
    attackFlowDatabase = "attackFlowDatabase",
    diagramExport = "diagramExport",
    diagramImport = "diagramImport",
    editMasterRegisterScenario = "editMasterRegisterScenario",
    editProjectRegisterScenario = "editProjectRegisterScenario",
    editRegister = "editRegister",
    exportActualMitigationMeasure = "exportActualMitigationMeasure",
    exportRegister = "exportRegister",
    // Policy -> associated mitigation measures dialogs
    mitigationLogAct = "mitigationLogAct",
    mitigationLogActGrouped = "mitigationLogActGrouped",
    mitigationLogMaster = "mitigationLogMaster",
    mitigationLogRec = "mitigationLogRec",
    mitigationLogRecGrouped = "mitigationLogRecGrouped",
    mitigationMappingAct = "mitigationMappingAct",
    mitigationMappingActGrouped = "mitigationMappingActGrouped",
    mitigationMappingMaster = "mitigationMappingMaster",
    mitigationMappingRec = "mitigationMappingRec",
    mitigationMappingRecGrouped = "mitigationMappingRecGrouped",
    mitigationMeasure = "mitigationMeasure",
    runAssessment = "runAssessment",
    uploadCactiFile = "uploadCactiFile",
    uploadDiagramFile = "uploadDiagramFile",
    uploadDirectory = "uploadDirectory",
    uploadFiles = "uploadFiles",
    uploadModuleDirectory = "uploadModuleDirectory",
    uploadTerraformFile = "uploadTerraformFile",
    uploadXMLFile = "uploadXMLFile",
    viewAssociatedRisk = "viewAssociatedRisk",
    viewConflictScenarioDetails = "viewConflictScenarioDetails",
    viewConflictResolve = "viewConflictResolve",
    viewFeedback = "viewFeedback",
    viewLLMScenarioReview = "viewLLMScenarioReview",
    viewLLMRiskScenario = "viewLLMRiskScenario",
    viewLog = "viewLog",
    viewDiagramWarnings = "viewDiagramWarnings",
    viewMasterRegisterScenario = "viewMasterRegisterScenario",
}

export type DialogStateEnumKeys = keyof typeof DialogStateEnum;

export type DialogState = { [key in DialogStateEnumKeys]: boolean };

export const initDialogState = getInitDialogState(
    Object.keys(DialogStateEnum) as DialogStateEnumKeys[]
);

export interface DialogStateProps {
    dialogState: DialogState;
    handleSetDialogState: (m: DialogState) => void;
    handleCloseDialog: () => void;
}

// DialogField

export enum DialogFieldStateEnum {
    addCanvas = "addCanvas",
    addEdgeDataAttribute = "addEdgeDataAttribute",
    addEdgeDataCactiAttribute = "addEdgeDataCactiAttribute",
    addEdgeMarkerEndAttribute = "addEdgeMarkerEndAttribute",
    addEdgeMarkerStartAttribute = "addEdgeMarkerStartAttribute",
    addEdgeStyleAttribute = "addEdgeStyleAttribute",
    addGroup = "addGroup",
    addMasterMitigation = "addMasterMitigation",
    addMitigationAct = "addMitigationAct",
    addMitigationMaster = "addMitigationMaster",
    addNodeDataAttribute = "addNodeDataAttribute",
    addNodeDataCactiAttribute = "addNodeDataCactiAttribute",
    addNodeStyleAttribute = "addNodeStyleAttribute",
    addProject = "addProject",
    addResourceTag = "addResourceTag",
    addUser = "addUser",
    attackFlow = "attackFlow",
    changeEmail = "changeEmail",
    changeGroupName = "changeGroupName",
    changeProjectGroup = "changeProjectGroup",
    changeProjectName = "changeProjectName",
    disableProject = "disableProject",
    duplicateProject = "duplicateProject",
    editCanvas = "editCanvas",
    editDisplayFrameworksSettings = "editDisplayFrameworksSettings",
    editGenerationSettings = "editGenerationSettings",
    enableProject = "enableProject",
    exportActualMitigationMeasure = "exportActualMitigationMeasure",
    exportMasterScenario = "exportMasterScenario",
    exportProject = "exportProject",
    exportProjectScenario = "exportProjectScenario",
    importCQForm = "importCQForm",
    importProject = "importProject",
    modifyCardField = "modifyCardField",
    modifyJiraSettings = "modifyJiraSettings",
    modifyMasterMitigation = "modifyMasterMitigation",
    modifyMitigation = "modifyMitigation",
    modifyMitigationAct = "modifyMitigationAct",
    modifyMitigationActGrouped = "modifyMitigationActGrouped",
    modifyMitigationMaster = "modifyMitigationMaster",
    modifyMitigationRec = "modifyMitigationRec",
    modifyMitigationRecGrouped = "modifyMitigationRecGrouped",
    modifyProject = "modifyProject",
    modifyProjectAccess = "modifyProjectAccess",
    modifyResourceTag = "modifyResourceTag",
    modifyResourceTagTierLevel = "modifyResourceTagTierLevel",
    modifySuperuser = "modifySuperuser",
    modifyUser = "modifyUser",
    resetPasswordAdmin = "resetPasswordAdmin",
    resetPasswordByToken = "resetPasswordByToken",
    resetPasswordTemp = "resetPasswordTemp",
    resetPasswordUser = "resetPasswordUser",
    selectScenarioTemplate = "selectScenarioTemplate",
    uploadLLMImage = "uploadLLMImage",
    viewLoginHistory = "viewLoginHistory",
    viewMitigationRec = "viewMitigationRec",
    viewMitigationRecGrouped = "viewMitigationRecGrouped",
    viewUserCredits = "viewUserCredits",
}
export type DialogFieldStateEnumKeys = keyof typeof DialogFieldStateEnum;

export type DialogFieldState = { [key in DialogFieldStateEnumKeys]: boolean };

export const initDialogFieldState = getInitDialogFieldState(
    Object.keys(DialogFieldStateEnum) as DialogFieldStateEnumKeys[]
);

// DialogConfirm

export enum DialogConfirmStateEnum {
    // architecture diagram
    confirmClearCanvas = "confirmClearCanvas",
    confirmCloseAttributeDrawerEdge = "confirmCloseAttributeDrawerEdge",
    confirmCloseAttributeDrawerNode = "confirmCloseAttributeDrawerNode",
    confirmDeleteDrawerEdge = "confirmDeleteDrawerEdge",
    confirmDeleteDrawerNode = "confirmDeleteDrawerNode",
    confirmDeleteNodesAndEdges = "confirmDeleteNodesAndEdges",
    confirmDeleteRegister = "confirmDeleteRegister",
    confirmDeleteResourceTags = "confirmDeleteResourceTags",
    confirmRunAssessment = "confirmRunAssessment",
    confirmSetDiagramComplete = "confirmSetDiagramComplete",
    confirmUnsetDiagramComplete = "confirmUnsetDiagramComplete",
    confirmUpdateUserStoryCard = "confirmUpdateUserStoryCard",
    requestToFillRequiredFields = "requestToFillRequiredFields",
    submitArchitectureDiagram = "submitArchitectureDiagram",
    // diagram cacti
    confirmDeleteCactiFile = "confirmDeleteCactiFile",
    confirmDeleteCactiFiles = "confirmDeleteCactiFiles",
    // diagram file
    confirmDeleteDiagramFile = "confirmDeleteDiagramFile",
    confirmDeleteDiagramFiles = "confirmDeleteDiagramFiles",
    // diagram terraform
    confirmDeleteTerraformFile = "confirmDeleteTerraformFile",
    confirmDeleteTerraformFiles = "confirmDeleteTerraformFiles",
    // diagram module
    confirmDeleteModuleFile = "confirmDeleteModuleFile",
    confirmDeleteModuleFiles = "confirmDeleteModuleFiles",
    // diagram XML
    confirmDeleteXMLFile = "confirmDeleteXMLFile",
    confirmDeleteXMLFiles = "confirmDeleteXMLFiles",
    // diagram PDF document (storage only)
    confirmDeletePdfFile = "confirmDeletePdfFile",
    confirmDeletePdfFiles = "confirmDeletePdfFiles",
    // generate diagram
    confirmGenerateDiagramBlank = "confirmGenerateDiagramBlank",
    confirmGenerateDiagramFromCacti = "confirmGenerateDiagramFromCacti",
    confirmGenerateDiagramFromIAC = "confirmGenerateDiagramFromIAC",
    confirmGenerateDiagramFromJson = "confirmGenerateDiagramFromJson",
    confirmGenerateDiagramFromLLM = "confirmGenerateDiagramFromLLM",
    confirmGenerateDiagramFromLLMWithDescription = "confirmGenerateDiagramFromLLMWithDescription",
    confirmGenerateDiagramFromTemplate = "confirmGenerateDiagramFromTemplate",
    confirmGenerateDiagramFromTopologyGenerator = "confirmGenerateDiagramFromTopologyGenerator",
    confirmGenerateDiagramFromXML = "confirmGenerateDiagramFromXML",
    // llm
    confirmGenerateLLMDiagram = "confirmGenerateLLMDiagram",
    // admin
    confirmDeleteGroup = "confirmDeleteGroup",
    confirmDeleteProject = "confirmDeleteProject",
    confirmDeleteProjects = "confirmDeleteProjects",
    confirmDisableProject = "confirmDisableProject",
    confirmEnableProject = "confirmEnableProject",
    confirmDeleteUser = "confirmDeleteUser",
    confirmDeleteUsers = "confirmDeleteUsers",
    confirmRevokeToken = "confirmRevokeToken",
    confirmRefreshRolePermissions = "confirmRefreshRolePermissions",
    // register
    confirmAddRegisterScenario = "confirmAddRegisterScenario",
    confirmAbortAssessment = "confirmAbortAssessment",
    confirmAcceptAllMitigation = "confirmAcceptAllMitigation",
    confirmCloseAddScenarioDialog = "confirmCloseAddScenarioDialog",
    confirmCloseAddMasterScenario = "confirmCloseAddMasterScenario",
    confirmCloseAddProjectScenario = "confirmCloseAddProjectScenario",
    confirmCloseEditMasterScenario = "confirmCloseEditMasterScenario",
    confirmCloseEditProjectScenario = "confirmCloseEditProjectScenario",
    confirmCloseRegisterDialog = "confirmCloseRegisterDialog",
    confirmDeleteLLMImage = "confirmDeleteLLMImage",
    confirmDeleteMasterScenario = "confirmDeleteMasterScenario",
    confirmDeleteMasterScenarios = "confirmDeleteMasterScenarios",
    confirmDeleteProjectAssessment = "confirmDeleteProjectAssessment",
    confirmFlushIncompleteProjectAssessment = "confirmFlushIncompleteProjectAssessment",
    confirmRemoveFailedProjectAssessment = "confirmRemoveFailedProjectAssessment",
    confirmRestoreProjectAssessment = "confirmRestoreProjectAssessment",
    confirmDeleteProjectScenario = "confirmDeleteProjectScenario",
    confirmDeleteProjectScenarios = "confirmDeleteProjectScenarios",
    confirmDeleteScenario = "confirmDeleteScenario",
    confirmDeleteScenarios = "confirmDeleteScenarios",
    confirmRemoveMitigationAct = "confirmRemoveMitigationAct",
    confirmRemoveMitigationMaster = "confirmRemoveMitigationMaster",
    confirmReset = "confirmReset",
    confirmSubmit = "confirmSubmit",
    // register conflicts
    confirmAcceptAllConflicts = "confirmAcceptAllConflicts",
    confirmIgnoreAllConflicts = "confirmIgnoreAllConflicts",
    // register llm
    confirmAddLLMScenarioToProjectRegister = "confirmAddLLMScenarioToProjectRegister",
    // feedback
    confirmDeleteFeedback = "confirmDeleteFeedback",
    // rec mitigations
    confirmAcceptRecMitigations = "confirmAcceptRecMitigations",
    confirmHideRecMitigations = "confirmHideRecMitigations",
    confirmUnhideRecMitigations = "confirmUnhideRecMitigations",
    // rec mitigations (grouped)
    confirmAcceptGroupedRecMitigations = "confirmAcceptGroupedRecMitigations",
    confirmHideGroupedRecMitigations = "confirmHideGroupedRecMitigations",
    confirmUnhideGroupedRecMitigations = "confirmUnhideGroupedRecMitigations",
    // act mitigations
    confirmDeleteActMitigation = "confirmDeleteActMitigation",
    confirmDeleteActMitigations = "confirmDeleteActMitigations",
    confirmMarkCompleteActMitigations = "confirmMarkCompleteActMitigations",
    confirmMarkIncompleteActMitigations = "confirmMarkIncompleteActMitigations",
}

export type DialogConfirmStateEnumKeys = keyof typeof DialogConfirmStateEnum;
export type DialogConfirmState = {
    [key in DialogConfirmStateEnumKeys]: boolean;
};

export const initDialogConfirmState = getInitDialogConfirmState(
    Object.keys(DialogConfirmStateEnum) as DialogConfirmStateEnumKeys[] //
);

export interface DialogConfirmStateProps {
    dialogConfirmState: DialogConfirmState;
    handleSetDialogConfirmState: (m: DialogConfirmState) => void;
    handleCloseDialogConfirm: () => void;
}

// LogDialog

export enum LogDialogStateEnum {
    mitigationAct = "mitigationAct",
    mitigationActGrouped = "mitigationActGrouped",
    mitigationMeasureAct = "mitigationMeasureAct",
    mitigationMeasureActGrouped = "mitigationMeasureActGrouped",
    //
    mitigationMaster = "mitigationMaster",
    mitigationMasterMeasure = "mitigationMasterMeasure",
    //
    mitigationMeasureRec = "mitigationMeasureRec",
    mitigationMeasureRecGrouped = "mitigationMeasureRecGrouped",
    mitigationRec = "mitigationRec",
    mitigationRecGrouped = "mitigationRecGrouped",
    //
    masterRegister = "masterRegister",
    masterRegisterScenario = "masterRegisterScenario",
    projectRegister = "projectRegister",
    projectRegisterScenario = "projectRegisterScenario",
    //
    projectCQ = "projectCQ",
    projectDiagram = "projectDiagram",
    projectDiagramEdge = "projectDiagramEdge",
    projectDiagramNode = "projectDiagramNode",
}

export type LogDialogStateEnumKeys = keyof typeof LogDialogStateEnum;
export type LogDialogState = { [key in LogDialogStateEnumKeys]: boolean };

export const initLogDialogState = getInitLogDialogState(
    Object.keys(LogDialogStateEnum) as LogDialogStateEnumKeys[] //
);

export interface LogDialogStateProps {
    logDialogState: LogDialogState;
    handleSetLogDialogState: (m: LogDialogState) => void;
    handleCloseLogDialog: () => void;
}

// Others

export type CloseDialogEventHandler = (
    _event?: unknown,
    _reason?: "backdropClick" | "escapeKeyDown"
) => void;

export type CloseDialogConfirmEventHandler = (
    _event?: unknown,
    _reason?: "backdropClick" | "escapeKeyDown"
) => void;

export type CloseDialogFieldEventHandler = (
    _event?: unknown,
    _reason?: "backdropClick" | "escapeKeyDown"
) => void;

export type CloseLogDialogEventHandler = (
    _event?: unknown,
    _reason?: "backdropClick" | "escapeKeyDown"
) => void;
