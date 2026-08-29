import type {
    DataGridProps,
    GridColDef,
    GridColumnVisibilityModel,
    GridRowSelectionModel,
    GridValidRowModel,
} from "@mui/x-data-grid";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { HandleType } from "@xyflow/react";
import type { FormikValues } from "formik";
import type { Store } from "redux";

import type { AppTNCFields } from "#root/interfaces/app_tnc";
import type { AppVersionFields } from "#root/interfaces/app_version";
import type { PreAuthFields } from "#root/interfaces/authentication";
import type { UserAuthorization, UserPolicyDoc, UserRoleDoc } from "#root/interfaces/authorization";
import type { ProjectCacti } from "#root/interfaces/cacti";
import type { ProjectDiagramFile } from "#root/interfaces/common";
import type { KbCsaCCoP } from "#root/interfaces/csa_ccop";
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
import type { ProjectDiagramFiles, ProjectDiagramPdfFiles } from "#root/interfaces/diagramFile";
import type {
    DialogConfirmStateEnumKeys,
    DialogFieldStateEnumKeys,
    DialogStateEnumKeys,
    LogDialogStateEnumKeys,
} from "#root/interfaces/dialog";
import type { ErrorDetails } from "#root/interfaces/error";
import type { FeedbackFormFields } from "#root/interfaces/feedback_form";
import type { FormFieldConfig, FormValueMap } from "#root/interfaces/formField";
import type { KbIM8 } from "#root/interfaces/im8";
import type { AuditLog, OptionLabel } from "#root/interfaces/index";
import type { Integration, JiraIssue, JiraIssueOptions } from "#root/interfaces/integration";
import type { MasterMitigation } from "#root/interfaces/mitigation";
import type {
    AttackFlowsGrouping,
    MitreDatabaseInterface,
    NodeAttackPathMapping,
} from "#root/interfaces/mitre";
import type {
    MuiFilterButtonStateProps,
    MuiFilterButtonValueProps,
} from "#root/interfaces/muiDataGridTable";
import type { KbNistCSF } from "#root/interfaces/nist_csf";
import type {
    Project,
    ProjectAssessment,
    ProjectAssessmentHistory,
} from "#root/interfaces/project";
import type {
    CQFormQuestion,
    ExtendedFieldConfig,
    ProjectAssessmentConfigObject,
    Question,
    QuestionOption,
    QuestionOptionGroup,
    TableRowParams,
} from "#root/interfaces/questionnaire";
import type {
    AttackStep,
    CheckboxFilterState,
    MasterRegister,
    ProjectRegister,
    ProjectRegisterFields,
    ScenarioTableFilterCheckboxItem,
} from "#root/interfaces/register";
import type { ResourceTagFields } from "#root/interfaces/resource_tag";
import type { ProjectStatistics } from "#root/interfaces/statistics";
import type { KBTosca } from "#root/interfaces/tosca";
import type { JWT_fields, UserAdminFields, UserCoreFields } from "#root/interfaces/user";
import type { UserCreditsFields } from "#root/interfaces/user_credits";
import type { ProjectXML } from "#root/interfaces/xml";
import type { ToolHistoryItem } from "#root/services/domain/tools";

import { KbISOIEC27001 } from "./isoiec27001";

export type AdminConsoleActionStatus = "unknown" | "pending" | "completed";

export interface AdminConsoleScanDetail {
    label: string;
    value: string;
}

export interface AdminConsoleScanState {
    skipScan: boolean;
    canExecute: boolean;
    isScanning: boolean;
    message: string;
    details: AdminConsoleScanDetail[];
    hasScanned: boolean;
    showStatusMessage: boolean;
    status: AdminConsoleActionStatus;
}

export interface AdminConsoleState {
    toolHistory: ToolHistoryItem[];
    toolHistoryVisible: boolean;
    toolHistoryLoading: boolean;
    toolHistoryLoadError: boolean;
    scanStateByToolKey: Record<string, AdminConsoleScanState>;
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

export interface AppVersionFeatureState {
    currentIndex: number;
    appVersionDialogLoaded: boolean;
}

export interface AppVersionFeatureReducer {
    setCurrentIndex: (
        state: AppVersionFeatureState,
        action: PayloadAction<AppVersionFeatureState["currentIndex"]>
    ) => void;
    setAppVersionDialogLoaded: (
        state: AppVersionFeatureState,
        action: PayloadAction<AppVersionFeatureState["appVersionDialogLoaded"]>
    ) => void;
}

export interface AssessmentSetupFeatureInstanceState {
    activeStep: number;
    isSaving: boolean;
    dirtySteps: Record<number, boolean>;
    formCompletionByStep: Record<number, boolean>;
}

export interface AssessmentSetupFeatureState {
    instances: Record<string, AssessmentSetupFeatureInstanceState>;
}

export interface AuthState {
    user_permission_list: string[];
    isAuthenticated: boolean;
    isAuthenticating: boolean;
    user: JWT_fields | null;
    /** Unix epoch (seconds) when the current access token cookie expires. */
    sessionExpiresAt: number | null;
    /** True when the idle-detection hook has triggered a "session expiring" warning. */
    showSessionWarning: boolean;
}

export interface AuthReducer {
    logout: () => AuthState;
    setUserPermissionList: (state: AuthState, action: PayloadAction<string[]>) => void;
    setIsAuthenticated: (state: AuthState, action: PayloadAction<boolean>) => void;
    setIsAuthenticating: (state: AuthState, action: PayloadAction<boolean>) => void;
    setUser: (state: AuthState, action: PayloadAction<JWT_fields | null>) => void;
    setSessionExpiresAt: (state: AuthState, action: PayloadAction<number | null>) => void;
    setShowSessionWarning: (state: AuthState, action: PayloadAction<boolean>) => void;
}

export interface LegacyBackendState {
    appTNC: AppTNCFields | null;
    appTNCLoaded: boolean;
    appTNCLoadError: boolean;
    appVersionData: AppVersionFields | null;
    appVersionDataLoaded: boolean;
    appVersionDataLoadError: boolean;
    appVersions: string[];
    appVersionsLoaded: boolean;
    appVersionsLoadError: boolean;
    attackFlowsGroupings: AttackFlowsGrouping[];
    attackFlowsGroupingsLoaded: boolean;
    attackFlowsGroupingsLoadError: boolean;
    authorization: UserAuthorization;
    authorizationLoaded: boolean;
    authorizationLoadError: boolean;
    feedbackForms: FeedbackFormFields[];
    feedbackFormsLoaded: boolean;
    feedbackFormsLoadError: boolean;
    integration: Integration | null;
    integrationLoaded: boolean;
    integrationLoadError: boolean;
    jiraIssue: JiraIssue | null;
    jiraIssueLoaded: boolean;
    jiraIssueLoadError: boolean;
    jiraIssueOptions: JiraIssueOptions | null;
    jiraIssueOptionsLoaded: boolean;
    jiraIssueOptionsLoadError: boolean;
    kbCsaCCoP: KbCsaCCoP | null;
    kbCsaCCoPLoaded: boolean;
    kbCsaCCoPLoadError: boolean;
    kbIM8: KbIM8 | null;
    kbIM8Loaded: boolean;
    kbIM8LoadError: boolean;
    kbISOIEC27001: KbISOIEC27001 | null;
    kbISOIEC27001Loaded: boolean;
    kbISOIEC27001LoadError: boolean;
    kbMitre: MitreDatabaseInterface | null;
    kbMitreLoaded: boolean;
    kbMitreLoadError: boolean;
    kbNistCSF: KbNistCSF | null;
    kbNistCSFLoaded: boolean;
    kbNistCSFLoadError: boolean;
    kbOwaspRegister: MasterRegister | null;
    kbOwaspRegisterLoaded: boolean;
    kbOwaspRegisterLoadError: boolean;
    kbTosca: KBTosca | null;
    kbToscaLoaded: boolean;
    kbToscaLoadError: boolean;
    projectAssessmentConfig: ProjectAssessmentConfigObject | null;
    projectAssessmentConfigLoaded: boolean;
    projectAssessmentConfigLoadError: boolean;
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
    projectDiagramFileTerraform: ProjectDiagramFile[];
    projectDiagramFileTerraformLoaded: boolean;
    projectDiagramFileTerraformLoadError: boolean;
    projectDiagramFileXml: ProjectXML | null;
    projectDiagramFileXmlLoaded: boolean;
    projectDiagramFileXmlLoadError: boolean;
    projectDiagramLogs: AuditLog[];
    projectDiagramLogsLoaded: boolean;
    projectDiagramLogsLoadError: boolean;
    // projectAssessmentConfig fields are declared above (from TP2-858-AK block)
    projectLogs: AuditLog[];
    projectLogsLoaded: boolean;
    projectLogsLoadError: boolean;
    projectRegister: ProjectRegister | null;
    projectRegisterLoaded: boolean;
    projectRegisterLoadError: boolean;
    projects: Project[];
    projectsLoaded: boolean;
    projectsLoadError: boolean;
    projectStatistics: ProjectStatistics | null;
    projectStatisticsLoaded: boolean;
    projectStatisticsLoadError: boolean;
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
    | "projectDiagramFileTerraform"
    | "projectDiagramFileTerraformLoaded"
    | "projectDiagramFileTerraformLoadError"
    | "projectDiagramFileXml"
    | "projectDiagramFileXmlLoaded"
    | "projectDiagramFileXmlLoadError"
    | "projectDiagramLogs"
    | "projectDiagramLogsLoaded"
    | "projectDiagramLogsLoadError"
    | "projectRegister"
    | "projectRegisterLoaded"
    | "projectRegisterLoadError"
    | "projectLogs"
    | "projectLogsLoaded"
    | "projectLogsLoadError"
    | "projectAssessmentConfig"
    | "projectAssessmentConfigLoaded"
    | "projectAssessmentConfigLoadError"
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

export interface FormFieldExternalState {
    hideInfoDrawer: boolean;
    hideUsefulness: boolean;
    isFieldDisabled: boolean;
    isInfoDrawerDisabled: boolean;
    isScenarioDialogDisabled: boolean;
    questionFromSource: CQFormQuestion | undefined;
    useTemplate: boolean;
}

export interface FormFieldInstanceState extends FormFieldExternalState {
    loaded: boolean;
}

export interface FormFieldFeatureState {
    instances: Record<string, FormFieldInstanceState>;
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

export interface MitreFeatureState {
    searchResultIds: string[];
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

export interface ProjectAssessmentInstanceState {
    activeAssessmentPollingVersion: string | null;
    projectAssessmentPageLimit: number;
    projectAssessmentPageNumber: number;
    deletingAssessmentId: string | null;
    pendingDeleteAssessmentId: string | null;
    pendingRemoveFailedAssessmentIds: string[];
    pendingRestoreAssessmentId: string | null;
    pendingRestoreEligibility: { has_cq: boolean; has_diagram: boolean } | null;
    restoringAssessmentId: string | null;
    projectWorkflowClickedAssess: boolean;
    projectWorkflowClickedAbort: boolean;
    projectWorkflowHeartbeatRunning: boolean;
    projectWorkflowProgress: number;
    projectWorkflowProgressInfo: string[];
    projectWorkflowRunLLM: boolean;
    projectWorkflowTrackedQuestionMapping: Record<string, boolean>;
}

export interface ProjectAssessmentState {
    instances: Record<string, ProjectAssessmentInstanceState>;
}

export interface ProjectDashboardFeatureInstanceState {
    projectSettingsSelectedToggle: string;
}

export interface ProjectDashboardFeatureState {
    instances: Record<string, ProjectDashboardFeatureInstanceState>;
}

export interface SignInContentFeatureInstanceState {
    rememberMe: boolean;
    signInConfirmed: boolean;
    signInFailureKind: "credentialMismatch" | "tooManyRequests" | null;
}

export interface SignInContentFeatureState {
    instances: Record<string, SignInContentFeatureInstanceState>;
}

export interface SignUpContentFeatureInstanceState {
    confirmPassword: string;
}

export interface SignUpContentFeatureState {
    instances: Record<string, SignUpContentFeatureInstanceState>;
}

export interface SignUpSuperuserContentFeatureInstanceState {
    confirmPassword: string;
}

export interface SignUpSuperuserContentFeatureState {
    instances: Record<string, SignUpSuperuserContentFeatureInstanceState>;
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
    nodeAttackPathMapping: NodeAttackPathMapping;
    viewAllPaths: boolean;
    pendingThreatOverviewScenarioScope: "top5" | "all" | null;
    threatOverviewScenarioScope: "top5" | "all";
    visibleThreatScenarioCanvasIds: string[];
    hideAllPaths: boolean;
    startAttackPath: boolean;
    threatScenarioExpandedFrameworkKeys: string[];
    attackPathSelectionFieldContentHeights: {
        collapsed: number;
        expanded: number;
    };
    joyrideViewType: CanvasType;
    capabilities: DiagramCapabilitiesState;
}

export interface DiagramState {
    instances: Record<string, DiagramInstanceState>;
    inTransition: boolean;
    diagramView: DiagramView;
}

export interface ProjectMitigationFeatureInstanceState {
    actGroupType: string;
    actProcessingRowAction: boolean;
    hideRec: boolean;
    mitigationTab: number;
    recGroupType: string;
    recProcessingRowAction: boolean;
}

export interface ProjectMitigationFeatureState {
    instances: Record<string, ProjectMitigationFeatureInstanceState>;
}

export interface ProjectRegisterFeatureInstanceState {
    registerTab: number;
    displayedRegisterTab: number;
    isSwitching: boolean;
    inTransition: boolean;
    viewConflictScenarioDetailsId: string;
    registerFilterTab: number;
    applicabilityFilterIndex: number[];
    checkboxFilterState: CheckboxFilterState;
    checkboxItems: ScenarioTableFilterCheckboxItem[];
    scenarios: ProjectRegisterFields[];
    filteredIdList: string[];
    /** True while an executive summary report is being generated. */
    executiveSummaryGenerating: boolean;
    /** 0-100 generation progress % for the executive summary report. */
    executiveSummaryProgress: number;
}

export interface ProjectRegisterFeatureState {
    instances: Record<string, ProjectRegisterFeatureInstanceState>;
}

export interface TableFieldExternalState {
    isFieldDisabled: boolean;
    isFieldTracked: boolean;
    extendedFieldConfig: ExtendedFieldConfig;
    fieldConfig: FormFieldConfig | undefined;
    formValues: FormValueMap;
    immutableFieldIdList: string[];
    question: Question | undefined;
    tableType: string;
    uniqueFieldIdList: string[];
}

export interface TableFieldInstanceState extends TableFieldExternalState {
    editTable: boolean;
    loaded: boolean;
    rows: TableRowParams[];
    savedRows: TableRowParams[];
    selectedTemplateIdList: string[];
}

export interface TableFieldFeatureState {
    instances: Record<string, TableFieldInstanceState>;
}

export interface RootState {
    adminConsole: AdminConsoleState;
    app: AppState;
    appVersionFeature: AppVersionFeatureState;
    assessmentSetupFeature: AssessmentSetupFeatureState;
    auth: AuthState;
    backend: BackendState;
    diagram: DiagramState;
    dialog: DialogStoreState;
    formFieldFeature: FormFieldFeatureState;
    layout: LayoutState;
    logDialogFeature: LogDialogFeatureState;
    mitreFeature: MitreFeatureState;
    muiDataGridFeature: MuiDataGridFeatureState;
    projectAssessment: ProjectAssessmentState;
    projectDashboardFeature: ProjectDashboardFeatureState;
    projectMitigationFeature: ProjectMitigationFeatureState;
    projectRegisterFeature: ProjectRegisterFeatureState;
    signInContentFeature: SignInContentFeatureState;
    signUpContentFeature: SignUpContentFeatureState;
    signUpSuperuserContentFeature: SignUpSuperuserContentFeatureState;
    tableFieldFeature: TableFieldFeatureState;
}

export type AppDispatch = Store<RootState>["dispatch"];
