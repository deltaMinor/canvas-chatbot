import type {
    DataGridProps,
    GridColDef,
    GridColumnVisibilityModel,
    GridRowSelectionModel,
    GridValidRowModel,
} from "@mui/x-data-grid";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { HandleType } from "@xyflow/react";
import type { Store } from "redux";

import type { PreAuthFields } from "#root/interfaces/authentication";
import type { UserAuthorization, UserPolicyDoc, UserRoleDoc } from "#root/interfaces/authorization";
import type { ProjectCacti } from "#root/interfaces/cacti";
import type { ProjectDiagramFile } from "#root/interfaces/common";
import type {
    CanvasType,
    DiagramCanvas,
    DiagramEdge,
    DiagramNode,
    LineSegment,
    MasterDiagramTemplate,
    NodeAttackStepCountMapping,
    NodeHandleEdgeMappingDict,
    ProjectDiagram,
    ProjectDiagramImageFiles,
    ResourceDrawerViewMode,
    SortDirection,
    WarningMessage,
    WarningMessageMapping,
    WarningReport,
} from "#root/interfaces/diagram";
import type { DiagramElementAttributes } from "#root/interfaces/diagramAttributes";
import type { DrawerState } from "#root/interfaces/diagramContent";
import type {
    ProjectDiagramFiles,
    ProjectDiagramGeneratedJsonFiles,
    ProjectDiagramPdfFiles,
} from "#root/interfaces/diagramFile";
import type {
    DialogConfirmStateEnumKeys,
    DialogFieldStateEnumKeys,
    DialogStateEnumKeys,
    LogDialogStateEnumKeys,
} from "#root/interfaces/dialog";
import type { ErrorDetails } from "#root/interfaces/error";
import type { AuditLog, OptionLabel } from "#root/interfaces/index";
import type { MasterMitigation } from "#root/interfaces/mitigation";
import type {
    MuiFilterButtonStateProps,
    MuiFilterButtonValueProps,
} from "#root/interfaces/muiDataGridTable";
import type {
    Project,
    ProjectAssessment,
    ProjectAssessmentHistory,
} from "#root/interfaces/project";
import type { AttackStep, MasterRegister, ProjectRegister } from "#root/interfaces/register";
import type { ResourceTagFields } from "#root/interfaces/resource_tag";
import type { KBTosca } from "#root/interfaces/tosca";
import type { UserAdminFields, UserCoreFields } from "#root/interfaces/user";
import type { ProjectXML } from "#root/interfaces/xml";

export type UserCreditsFields = Record<string, unknown>;

export interface ProjectCQState {
    schema_?: string;
}

export interface AppState {
    errorDetails: ErrorDetails[];
    secondsLeft: number;
}

export interface AppReducer {
    setErrorDetails: (state: AppState, action: PayloadAction<ErrorDetails[]>) => void;
    setSecondsLeft: (state: AppState, action: PayloadAction<number>) => void;
    decrementSecondsLeft: (state: AppState) => void;
    resetSecondsLeft: (state: AppState, action: PayloadAction<number | undefined>) => void;
}

export interface LegacyBackendState {
    appTNC: Record<string, unknown> | null;
    appTNCLoaded: boolean;
    appTNCLoadError: boolean;
    appVersionData: Record<string, unknown> | null;
    appVersionDataLoaded: boolean;
    appVersionDataLoadError: boolean;
    appVersions: Record<string, unknown>[];
    appVersionsLoaded: boolean;
    appVersionsLoadError: boolean;
    attackFlowsGroupings: Record<string, unknown>[];
    attackFlowsGroupingsLoaded: boolean;
    authorization: UserAuthorization;
    authorizationLoaded: boolean;
    authorizationLoadError: boolean;
    feedbackForms: Record<string, unknown>[];
    feedbackFormsLoaded: boolean;
    feedbackFormsLoadError: boolean;
    integration: Record<string, unknown> | null;
    integrationLoaded: boolean;
    integrationLoadError: boolean;
    jiraIssue: Record<string, unknown> | null;
    jiraIssueLoaded: boolean;
    jiraIssueLoadError: boolean;
    jiraIssueOptions: Record<string, unknown> | null;
    jiraIssueOptionsLoaded: boolean;
    jiraIssueOptionsLoadError: boolean;
    kbOwaspRegister: MasterRegister | null;
    kbOwaspRegisterLoaded: boolean;
    kbOwaspRegisterLoadError: boolean;
    kbTosca: KBTosca | null;
    kbToscaLoaded: boolean;
    kbToscaLoadError: boolean;
    masterCQ: Record<string, unknown> | null;
    masterCQLoaded: boolean;
    masterCQLoadError: boolean;
    masterCQTemplate: Record<string, unknown> | null;
    masterCQTemplateLoaded: boolean;
    masterCQTemplateLoadError: boolean;
    masterDiagramTemplates: MasterDiagramTemplate[];
    masterDiagramTemplatesLoaded: boolean;
    masterDiagramTemplatesLoadError: boolean;
    masterMitigation: MasterMitigation | null;
    masterMitigationLoaded: boolean;
    masterMitigationLoadError: boolean;
    masterMitigationLogs: AuditLog[];
    masterMitigationLogsLoaded: boolean;
    masterMitigationLogsLoadError: boolean;
    masterMitigationMeasureLogs: AuditLog[];
    masterMitigationMeasureLogsLoaded: boolean;
    masterMitigationMeasureLogsLoadError: boolean;
    masterRegister: MasterRegister | null;
    masterRegisterLoaded: boolean;
    masterRegisterLoadError: boolean;
    masterRegisterLogs: AuditLog[];
    masterRegisterLogsLoaded: boolean;
    masterRegisterLogsLoadError: boolean;
    preAuth: PreAuthFields | null;
    preAuthLoaded: boolean;
    preAuthLoadError: boolean;
    project: Project | null;
    projectLoaded: boolean;
    projectLoadError: boolean;
    projectAssessment: ProjectAssessment | null;
    projectAssessmentLoaded: boolean;
    projectAssessmentLoadError: boolean;
    projectAssessmentHistory: ProjectAssessmentHistory | null;
    projectAssessmentHistoryLoaded: boolean;
    projectAssessmentHistoryLoadError: boolean;
    projectDiagram: ProjectDiagram | null;
    projectDiagramLoaded: boolean;
    projectDiagramLoadError: boolean;
    projectDiagramFileCacti: ProjectCacti | null;
    projectDiagramFileCactiLoaded: boolean;
    projectDiagramFileCactiLoadError: boolean;
    projectDiagramFileImage: ProjectDiagramImageFiles | null;
    projectDiagramFileImageLoaded: boolean;
    projectDiagramFileImageLoadError: boolean;
    projectDiagramFileJson: ProjectDiagramFiles | null;
    projectDiagramFileJsonLoaded: boolean;
    projectDiagramFileJsonLoadError: boolean;
    projectDiagramFileModule: ProjectDiagramFile[];
    projectDiagramFileModuleLoaded: boolean;
    projectDiagramFileModuleLoadError: boolean;
    projectDiagramFilePdf: ProjectDiagramPdfFiles | null;
    projectDiagramFilePdfLoaded: boolean;
    projectDiagramFilePdfLoadError: boolean;
    projectDiagramFileGeneratedJson: ProjectDiagramGeneratedJsonFiles | null;
    projectDiagramFileGeneratedJsonLoaded: boolean;
    projectDiagramFileGeneratedJsonLoadError: boolean;
    projectDiagramFileTerraform: ProjectDiagramFile[];
    projectDiagramFileTerraformLoaded: boolean;
    projectDiagramFileTerraformLoadError: boolean;
    projectDiagramFileXml: ProjectXML | null;
    projectDiagramFileXmlLoaded: boolean;
    projectDiagramFileXmlLoadError: boolean;
    projectDiagramLogs: AuditLog[];
    projectDiagramLogsLoaded: boolean;
    projectDiagramLogsLoadError: boolean;
    projectCQ: ProjectCQState | null;
    projectCQLoaded: boolean;
    projectCQLoadError: boolean;
    projectCQLogs: Record<string, unknown>[];
    projectCQLogsLoaded: boolean;
    projectCQLogsLoadError: boolean;
    projectCQTemplate: Record<string, unknown> | null;
    projectCQTemplateLoaded: boolean;
    projectCQTemplateLoadError: boolean;
    projectLogs: AuditLog[];
    projectLogsLoaded: boolean;
    projectLogsLoadError: boolean;
    projectRegister: ProjectRegister | null;
    projectRegisterLoaded: boolean;
    projectRegisterLoadError: boolean;
    projectStatistics: Record<string, unknown> | null;
    projectStatisticsLoaded: boolean;
    projectStatisticsLoadError: boolean;
    projects: Project[];
    projectsLoaded: boolean;
    projectsLoadError: boolean;
    resourceTags: ResourceTagFields[];
    resourceTagsLoaded: boolean;
    resourceTagsLoadError: boolean;
    user: UserCoreFields | null;
    userLoaded: boolean;
    userLoadError: boolean;
    userCredits: UserCreditsFields | null;
    userCreditsLoaded: boolean;
    userCreditsLoadError: boolean;
    userPolicyOptions: UserPolicyDoc[];
    userPolicyOptionsLoaded: boolean;
    userPolicyOptionsLoadError: boolean;
    userRoleOptions: UserRoleDoc[];
    userRoleOptionsLoaded: boolean;
    userRoleOptionsLoadError: boolean;
    users: UserAdminFields[];
    usersLoaded: boolean;
    usersLoadError: boolean;
}

export type ProjectStateKey =
    | "project"
    | "projectLoaded"
    | "projectLoadError"
    | "projectAssessment"
    | "projectAssessmentLoaded"
    | "projectAssessmentLoadError"
    | "projectAssessmentHistory"
    | "projectAssessmentHistoryLoaded"
    | "projectAssessmentHistoryLoadError"
    | "projectDiagram"
    | "projectDiagramLoaded"
    | "projectDiagramLoadError"
    | "projectDiagramFileCacti"
    | "projectDiagramFileCactiLoaded"
    | "projectDiagramFileCactiLoadError"
    | "projectDiagramFileImage"
    | "projectDiagramFileImageLoaded"
    | "projectDiagramFileImageLoadError"
    | "projectDiagramFileJson"
    | "projectDiagramFileJsonLoaded"
    | "projectDiagramFileJsonLoadError"
    | "projectDiagramFileModule"
    | "projectDiagramFileModuleLoaded"
    | "projectDiagramFileModuleLoadError"
    | "projectDiagramFilePdf"
    | "projectDiagramFilePdfLoaded"
    | "projectDiagramFilePdfLoadError"
    | "projectDiagramFileGeneratedJson"
    | "projectDiagramFileGeneratedJsonLoaded"
    | "projectDiagramFileGeneratedJsonLoadError"
    | "projectDiagramFileTerraform"
    | "projectDiagramFileTerraformLoaded"
    | "projectDiagramFileTerraformLoadError"
    | "projectDiagramFileXml"
    | "projectDiagramFileXmlLoaded"
    | "projectDiagramFileXmlLoadError"
    | "projectDiagramLogs"
    | "projectDiagramLogsLoaded"
    | "projectDiagramLogsLoadError"
    | "projectCQ"
    | "projectCQLoaded"
    | "projectCQLoadError"
    | "projectCQLogs"
    | "projectCQLogsLoaded"
    | "projectCQLogsLoadError"
    | "projectCQTemplate"
    | "projectCQTemplateLoaded"
    | "projectCQTemplateLoadError"
    | "projectRegister"
    | "projectRegisterLoaded"
    | "projectRegisterLoadError"
    | "projectLogs"
    | "projectLogsLoaded"
    | "projectLogsLoadError"
    | "projectStatistics"
    | "projectStatisticsLoaded"
    | "projectStatisticsLoadError";

export type ProjectScopedState = Pick<LegacyBackendState, ProjectStateKey>;

export interface BackendState extends Omit<LegacyBackendState, ProjectStateKey> {
    projectStates: Record<string, ProjectScopedState>;
}

export type DialogStateStore = {
    [K in DialogStateEnumKeys]: boolean;
};

export type DialogConfirmStateStore = {
    [K in DialogConfirmStateEnumKeys]: boolean;
};

export type DialogFieldStateStore = {
    [K in DialogFieldStateEnumKeys]: boolean;
};

export type LogDialogStateStore = {
    [K in LogDialogStateEnumKeys]: boolean;
};

export interface DialogStoreState
    extends DialogStateStore, DialogConfirmStateStore, DialogFieldStateStore, LogDialogStateStore {}

export type DialogStatePayload = Partial<DialogStoreState>;
export type DialogStateKey = keyof DialogStoreState;

export interface DialogReducer {
    openDialog: (state: DialogStoreState, action: PayloadAction<DialogStateKey>) => void;
    closeDialog: (state: DialogStoreState, action: PayloadAction<DialogStateKey>) => void;
    setDialogState: (state: DialogStoreState, action: PayloadAction<DialogStatePayload>) => void;
    closeAllDialogs: (state: DialogStoreState) => void;
}

export interface LayoutState {
    activeSection: string;
    activeNavKey: string;
    hoveringHeaderNavKey: string;
    sidebarToggle: boolean;
    expandSidebar: boolean;
}

export interface LayoutReducer {
    setActiveSection: (state: LayoutState, action: PayloadAction<string>) => void;
    setActiveNavKey: (state: LayoutState, action: PayloadAction<string>) => void;
    setHoveringHeaderNavKey: (state: LayoutState, action: PayloadAction<string>) => void;
    setSidebarToggle: (state: LayoutState, action: PayloadAction<boolean>) => void;
    toggleSidebar: (state: LayoutState) => void;
    closeSidebar: (state: LayoutState) => void;
    setExpandSidebar: (state: LayoutState, action: PayloadAction<boolean>) => void;
}

export interface LayoutSliceInterface {
    reducer: (
        state: LayoutState | undefined,
        action: { type: string; payload?: unknown }
    ) => LayoutState;
    actions: {
        setActiveSection: (payload: string) => { type: string; payload: string };
        setActiveNavKey: (payload: string) => { type: string; payload: string };
        setHoveringHeaderNavKey: (payload: string) => { type: string; payload: string };
        setSidebarToggle: (payload: boolean) => { type: string; payload: boolean };
        toggleSidebar: () => { type: string };
        closeSidebar: () => { type: string };
        setExpandSidebar: (payload: boolean) => { type: string; payload: boolean };
    };
}

export interface LogDialogInstanceState {
    logs: AuditLog[];
    detailsDialogOpen: boolean;
    excludedKeys: string[];
    loaded: boolean;
    selectedAuditLogId: string | null;
}

export interface LogDialogFeatureState {
    instances: Record<string, LogDialogInstanceState>;
}

export interface MuiDataGridInstanceState {
    columnVisibilityModel: GridColumnVisibilityModel;
    columns: GridColDef[];
    dataGridProps: Partial<Record<keyof DataGridProps, unknown>>;
    defaultVisibleFields: string[];
    filterButtonState: MuiFilterButtonStateProps;
    filterButtonValues: MuiFilterButtonValueProps;
    openAdvancedToolbar: boolean;
    refRows: unknown[];
    rows: GridValidRowModel[];
    rowsInitialized: boolean;
    rowSelectionModel: GridRowSelectionModel;
    selectedRow: GridValidRowModel | undefined;
    selectedRowId: string;
    selectedRows: GridValidRowModel[];
}

export interface MuiDataGridFeatureState {
    instances: Record<string, MuiDataGridInstanceState>;
}

export type DiagramPendingDrawerKey = "attackPath" | "overview" | "nodes" | "edges" | null;
export type DiagramRequestedThreatScenarioDrawerKey = DiagramPendingDrawerKey;
export type DiagramView = "joyride" | "editor" | "visualizer" | null;

/**
 * Combined show + enabled state for a single toolbar button.
 * All contributing factors (canvas type, view_only, isLocked, authorization,
 * completion state, warning checks) are already baked in; no further ANDs needed.
 */
export interface DiagramButtonState {
    /** Whether to render the button at all. */
    show: boolean;
    /** Whether the button is interactive (not disabled). */
    enabled: boolean;
}

/**
 * Per-button capability map for the diagram main toolbar and all meaningful
 * API-triggering controls.  Each key maps to a DiagramButtonState so
 * components use plain dot notation; no further AND-ing needed.
 */
export interface DiagramToolbarCapabilities {
    import: DiagramButtonState;
    export: DiagramButtonState;
    clear: DiagramButtonState;
    logs: DiagramButtonState;
    setComplete: DiagramButtonState;
    unsetComplete: DiagramButtonState;
    tutorial: DiagramButtonState;
    /** Undo last canvas action. */
    undo: DiagramButtonState;
    /** Redo last undone canvas action. */
    redo: DiagramButtonState;
    /** Toggle bidirectional arrow mode for new edges. */
    biDirectionalArrow: DiagramButtonState;
    /** Save button in node attribute drawer. */
    nodeDrawerSave: DiagramButtonState;
    /** Save button in edge attribute drawer. */
    edgeDrawerSave: DiagramButtonState;
    /** All edit-toolbar action buttons (align, layer, distribute, copy/paste/delete). */
    editToolbar: DiagramButtonState;
    /** Delete-node button in the node attribute drawer header. */
    nodeDrawerDelete: DiagramButtonState;
    /** Delete-edge button in the edge attribute drawer header. */
    edgeDrawerDelete: DiagramButtonState;
    /** View-logs menu option in the node attribute drawer header. */
    nodeDrawerLogs: DiagramButtonState;
    /** View-logs menu option in the edge attribute drawer header. */
    edgeDrawerLogs: DiagramButtonState;
    /** Confirm button in the diagram setup (import/clear) dialog. */
    setupDialogConfirm: DiagramButtonState;
    /** Upload/create action for JSON diagram file. */
    importJsonFileCreate: DiagramButtonState;
    /** Delete action for JSON diagram file. */
    importJsonFileDelete: DiagramButtonState;
    /** Upload/create action for Cacti file. */
    importCactiFileCreate: DiagramButtonState;
    /** Delete action for Cacti file. */
    importCactiFileDelete: DiagramButtonState;
    /** Upload/create action for image/PDF file. */
    importImageFileCreate: DiagramButtonState;
    /** Update action for image/PDF file. */
    importImageFileUpdate: DiagramButtonState;
    /** Delete action for image/PDF file. */
    importImageFileDelete: DiagramButtonState;
    /** Upload/create action for XML file. */
    importXmlFileCreate: DiagramButtonState;
    /** Delete action for XML file. */
    importXmlFileDelete: DiagramButtonState;
    /** Upload/create action for module file (IaC). */
    importModuleFileCreate: DiagramButtonState;
    /** Delete action for module file (IaC). */
    importModuleFileDelete: DiagramButtonState;
    /** Upload/create action for Terraform file. */
    importTerraformFileCreate: DiagramButtonState;
    /** Delete action for Terraform file. */
    importTerraformFileDelete: DiagramButtonState;
    /** Upload/create action for storage-only PDF document file. */
    uploadPdfFileCreate: DiagramButtonState;
    /** Delete action for storage-only PDF document file. */
    uploadPdfFileDelete: DiagramButtonState;
    /** Delete action for storage-only generated topology JSON file. */
    deleteGeneratedJsonFile: DiagramButtonState;
    /** Enable selecting JSON option in setup dialog radio group. */
    selectJsonOption: DiagramButtonState;
    /** Enable selecting Cacti option in setup dialog radio group. */
    selectCactiOption: DiagramButtonState;
    /** Enable selecting Image option in setup dialog radio group. */
    selectImageOption: DiagramButtonState;
    /** Enable selecting XML option in setup dialog radio group. */
    selectXmlOption: DiagramButtonState;
    /** Enable selecting IaC option in setup dialog radio group. */
    selectIacOption: DiagramButtonState;
    /** Enable selecting PDF upload option in setup dialog radio group. */
    selectPdfOption: DiagramButtonState;
    /** Enable selecting "View generated JSONs" option in the import dialog radio group. */
    selectGeneratedJsonOption: DiagramButtonState;
    /** Enable Terraform tab within IaC option body. */
    iacTerraformTab: DiagramButtonState;
    /** Enable Module Directory tab within IaC option body. */
    iacModuleTab: DiagramButtonState;
}

/**
 * Single source of truth for all diagram editing capabilities.
 * Computed by useDiagramCapabilities and kept in sync via Redux.
 * When a value is { show: true, enabled: true } that is the final answer;
 * no component should AND additional conditions on top.
 */
export interface DiagramCapabilitiesState {
    /** Per-button combined capability; see DiagramButtonState and DiagramToolbarCapabilities. */
    toolbar: DiagramToolbarCapabilities;
    /**
     * Per-canvas editing capability.
     * Key: canvas_id. Value: true when editing is allowed on that canvas
     * (canvas.view_only=false AND not globally locked AND authorized).
     */
    canvases: Record<string, boolean>;
}

export interface DiagramEditToolbarState {
    general: boolean;
    delete: boolean;
    alignment: boolean;
    distribution: boolean;
    layering: boolean;
}

export interface DiagramInstanceState {
    canvasHistory: DiagramCanvas[];
    canvasHistoryIndex: number;
    selectedNodeIdList: string[];
    selectedEdgeIdList: string[];
    miniMapExpanded: boolean;
    setupPendingSelectedOption: string;
    setupSelectedOption: string;
    setupSelectedTemplateCanvasId: string;
    setupNaturalLanguageDescription: string;
    hiddenEdgeIds: string[];
    warningListMapping: WarningMessageMapping;
    toscaReportMapping: { [id: string]: WarningReport[] };
    warningFilterKey: string;
    warningSortDirection: SortDirection;
    warningSortCriteria: string;
    hiddenWarningIdList: string[];
    warningList: WarningMessage[];
    isConnecting: boolean;
    isConnectingHandleType: HandleType;
    draftCanvasId: string;
    draftCanvas: DiagramCanvas | undefined;
    draftNode: DiagramNode | null;
    draftEdge: DiagramEdge | null;
    draftNodeLabel: string;
    draftEdgeLabel: string;
    draftNodeAttributes: DiagramElementAttributes | null;
    draftEdgeAttributes: DiagramElementAttributes | null;
    draftNodeLoaded: boolean;
    draftEdgeLoaded: boolean;
    isNodeDrawerDirty: boolean;
    isEdgeDrawerDirty: boolean;
    viewSelectDisabled: boolean;
    backendSaveEnabled: boolean;
    pendingDrawerKey: DiagramPendingDrawerKey;
    requestedThreatScenarioDrawerKey: DiagramRequestedThreatScenarioDrawerKey;
    biDirectionalArrow: boolean;
    overlayEdges: DiagramEdge[];
    overlayNodes: DiagramNode[];
    lineSegments: Record<string, LineSegment[]>;
    edgeSegmentedPaths: Record<string, string>;
    nodeHandleEdgeMapping: NodeHandleEdgeMappingDict;
    canvasInit: boolean;
    selectedPathId: string;
    pathSelectDisabled: boolean;
    targetNodeId: string;
    targetEdgeId: string;
    targetNodePulseToken: number;
    targetEdgePulseToken: number;
    stepNumber: number;
    viewNodeDetails: boolean;
    viewEdgeDetails: boolean;
    selectedTabGroup: string;
    selectedDataflowCanvasId: string;
    editToolbarState: DiagramEditToolbarState;
    drawerState: DrawerState;
    resourceDrawerSelected: OptionLabel;
    resourceDrawerSearchStrings: string[];
    resourceDrawerViewMode: ResourceDrawerViewMode;
    isAttributeDrawerOpen: boolean;
    selectedAttackStep: AttackStep;
    nodeAttackStepCountMapping: NodeAttackStepCountMapping;
    viewAllPaths: boolean;
    pendingThreatOverviewScenarioScope: "top5" | "all" | null;
    threatOverviewScenarioScope: "top5" | "all";
    visibleThreatScenarioCanvasIds: string[];
    hideAllPaths: boolean;
    threatScenarioExpandedFrameworkKeys: string[];
    joyrideViewType: CanvasType;
    capabilities: DiagramCapabilitiesState;
}

export interface DiagramState {
    instances: Record<string, DiagramInstanceState>;
    inTransition: boolean;
    diagramView: DiagramView;
}

export interface RootState {
    app: AppState;
    backend: BackendState;
    diagram: DiagramState;
    dialog: DialogStoreState;
    layout: LayoutState;
    logDialogFeature: LogDialogFeatureState;
    muiDataGridFeature: MuiDataGridFeatureState;
}

export type AppDispatch = Store<RootState>["dispatch"];
