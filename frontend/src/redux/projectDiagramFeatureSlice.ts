import { ActionCreatorWithPayload, PayloadAction, Reducer, createSlice } from "@reduxjs/toolkit";
import { HandleType } from "@xyflow/react";

import { options_dict } from "#root/constants/diagramSetupDialog";
import { OptionLabel } from "#root/interfaces";
import {
    CanvasColumn,
    CanvasType,
    DiagramCanvas,
    DiagramEdge,
    DiagramNode,
    LineSegment,
    NodeAttackStepCountMapping,
    NodeHandleEdgeMappingDict,
    ResourceDrawerKey,
    ResourceDrawerLabel,
    ResourceDrawerViewMode,
    SortDirection,
    WarningFilterKey,
    WarningMessage,
    WarningMessageMapping,
    WarningReport,
    WarningSortCriteriaKey,
} from "#root/interfaces/diagram";
import type { DrawerState } from "#root/interfaces/diagramContent";
import { NodeAttackPathMapping } from "#root/interfaces/mitre";
import type {
    DiagramCapabilitiesState,
    DiagramInstanceState,
    DiagramPendingDrawerKey,
    DiagramRequestedThreatScenarioDrawerKey,
    DiagramState,
    DiagramView,
} from "#root/interfaces/redux";
import type {
    DiagramInstancePayload,
    InitializeDiagramInstancePayload,
    SetDiagramAttackPathMappingPayload,
    SetDiagramAttackStepCountMappingPayload,
    SetDiagramAttackStepPayload,
    SetDiagramBooleanPayload,
    SetDiagramCanvasColumnMappingPayload,
    SetDiagramCanvasHistoryPayload,
    SetDiagramCanvasPayload,
    SetDiagramDrawerStatePayload,
    SetDiagramEdgePayload,
    SetDiagramEdgeSegmentedPathsPayload,
    SetDiagramEdgesPayload,
    SetDiagramEditToolbarStatePayload,
    SetDiagramElementAttributesPayload,
    SetDiagramLineSegmentsPayload,
    SetDiagramNodeHandleEdgeMappingPayload,
    SetDiagramNodePayload,
    SetDiagramNodesPayload,
    SetDiagramNumberPayload,
    SetDiagramOptionLabelArrayMappingPayload,
    SetDiagramOptionLabelPayload,
    SetDiagramPendingDrawerKeyPayload,
    SetDiagramPendingThreatOverviewScenarioScopePayload,
    SetDiagramRequestedThreatScenarioDrawerKeyPayload,
    SetDiagramStringArrayPayload,
    SetDiagramStringPayload,
    SetDiagramToscaReportMappingPayload,
    SetDiagramWarningMessageListPayload,
    SetDiagramWarningMessageMappingPayload,
} from "#root/interfaces/reduxPayload";
import { AttackStep } from "#root/interfaces/register";
import { createProjectFeatureSliceHelpers } from "#root/utils/projectFeatureSlice";

const DIAGRAM_FEATURE_KEY = "diagram";

export type {
    DiagramButtonState,
    DiagramCapabilitiesState,
    DiagramEditToolbarState,
    DiagramInstanceState,
    DiagramPendingDrawerKey,
    DiagramRequestedThreatScenarioDrawerKey,
    DiagramState,
    DiagramView,
} from "#root/interfaces/redux";

export const createInitialDiagramInstanceState = (): DiagramInstanceState => ({
    canvasHistory: [],
    canvasHistoryIndex: 0,
    selectedNodeIdList: [],
    selectedEdgeIdList: [],
    miniMapExpanded: false,
    setupPendingSelectedOption: options_dict.template.key,
    setupSelectedOption: options_dict.template.key,
    setupSelectedTemplateCanvasId: "",
    setupNaturalLanguageDescription: "",
    userStoryPendingSelectedDataNodesMapping: {},
    userStoryNodesPositionApplyToAll: false,
    userStoryCanvasColumnButtonSelectedPositionMapping: {},
    hiddenEdgeIds: [],
    warningListMapping: {},
    toscaReportMapping: {},
    warningFilterKey: WarningFilterKey.show_default.toString(),
    warningSortDirection: SortDirection.ascending,
    warningSortCriteria: WarningSortCriteriaKey.priority.toString(),
    hiddenWarningIdList: [],
    warningList: [],
    isConnecting: false,
    isConnectingHandleType: "source",
    draftCanvasId: "",
    draftCanvas: undefined,
    draftNode: null,
    draftEdge: null,
    draftNodeLabel: "",
    draftEdgeLabel: "",
    draftNodeAttributes: null,
    draftEdgeAttributes: null,
    draftNodeLoaded: false,
    draftEdgeLoaded: false,
    isNodeDrawerDirty: false,
    isEdgeDrawerDirty: false,
    viewSelectDisabled: false,
    backendSaveEnabled: true,
    pendingDrawerKey: null,
    requestedThreatScenarioDrawerKey: "attackPath",
    biDirectionalArrow: false,
    overlayEdges: [],
    overlayNodes: [],
    lineSegments: {},
    edgeSegmentedPaths: {},
    nodeHandleEdgeMapping: {},
    canvasInit: false,
    selectedPathId: "",
    pathSelectDisabled: false,
    targetNodeId: "",
    targetEdgeId: "",
    targetNodePulseToken: 0,
    targetEdgePulseToken: 0,
    stepNumber: 1,
    viewNodeDetails: false,
    viewEdgeDetails: false,
    selectedTabGroup: CanvasType.architecture,
    selectedDataflowCanvasId: "",
    editToolbarState: {
        general: false,
        delete: false,
        alignment: false,
        distribution: false,
        layering: false,
    },
    drawerState: {
        diagram_resource: false,
        diagram_user_story: false,
        edge_info: false,
        layout: false,
        node_info: false,
        node: false,
        diagram_threat_scenario: false,
        diagram_threat_scenario_nodes: false,
        diagram_threat_scenario_edges: false,
    },
    resourceDrawerSelected: {
        label: ResourceDrawerLabel.general,
        value: ResourceDrawerKey.general.toString(),
    },
    resourceDrawerSearchStrings: [],
    resourceDrawerViewMode: "list",
    isAttributeDrawerOpen: false,
    selectedAttackStep: {} as AttackStep,
    nodeAttackStepCountMapping: {} as NodeAttackStepCountMapping,
    nodeAttackPathMapping: {} as NodeAttackPathMapping,
    viewAllPaths: false,
    pendingThreatOverviewScenarioScope: null,
    threatOverviewScenarioScope: "top5",
    visibleThreatScenarioCanvasIds: [],
    hideAllPaths: false,
    startAttackPath: false,
    threatScenarioExpandedFrameworkKeys: [],
    attackPathSelectionFieldContentHeights: {
        collapsed: 0,
        expanded: 0,
    },
    joyrideViewType: CanvasType.architecture,
    capabilities: {
        toolbar: {
            import: { show: false, enabled: false },
            export: { show: false, enabled: false },
            clear: { show: false, enabled: false },
            logs: { show: false, enabled: false },
            llmDataflow: { show: false, enabled: false },
            setComplete: { show: false, enabled: false },
            unsetComplete: { show: false, enabled: false },
            tutorial: { show: false, enabled: false },
            undo: { show: false, enabled: false },
            redo: { show: false, enabled: false },
            biDirectionalArrow: { show: false, enabled: false },
            nodeDrawerSave: { show: false, enabled: false },
            edgeDrawerSave: { show: false, enabled: false },
            dataFlowDrawerEdit: { show: false, enabled: false },
            editToolbar: { show: false, enabled: false },
            nodeDrawerDelete: { show: false, enabled: false },
            edgeDrawerDelete: { show: false, enabled: false },
            nodeDrawerLogs: { show: false, enabled: false },
            edgeDrawerLogs: { show: false, enabled: false },
            setupDialogConfirm: { show: false, enabled: false },
            importJsonFileCreate: { show: false, enabled: false },
            importJsonFileDelete: { show: false, enabled: false },
            importCactiFileCreate: { show: false, enabled: false },
            importCactiFileDelete: { show: false, enabled: false },
            importImageFileCreate: { show: false, enabled: false },
            importImageFileUpdate: { show: false, enabled: false },
            importImageFileDelete: { show: false, enabled: false },
            importXmlFileCreate: { show: false, enabled: false },
            importXmlFileDelete: { show: false, enabled: false },
            importModuleFileCreate: { show: false, enabled: false },
            importModuleFileDelete: { show: false, enabled: false },
            importTerraformFileCreate: { show: false, enabled: false },
            importTerraformFileDelete: { show: false, enabled: false },
            selectJsonOption: { show: false, enabled: false },
            selectCactiOption: { show: false, enabled: false },
            selectImageOption: { show: false, enabled: false },
            selectXmlOption: { show: false, enabled: false },
            selectIacOption: { show: false, enabled: false },
            iacTerraformTab: { show: false, enabled: false },
            iacModuleTab: { show: false, enabled: false },
        },
        canvases: {},
    },
});

const initialState: DiagramState = {
    instances: {},
    inTransition: false,
    diagramView: "editor",
};

const { ensureInstance: ensureDiagramInstance, getResolvedInstanceId: getDiagramInstanceId } =
    createProjectFeatureSliceHelpers<DiagramInstanceState, DiagramState>(
        DIAGRAM_FEATURE_KEY,
        createInitialDiagramInstanceState
    );

const getDiagramPayload = <T>(
    payload: T | DiagramInstancePayload<T>
): DiagramInstancePayload<T> => {
    if (typeof payload === "object" && payload !== null && "value" in payload) {
        return {
            ...(payload as DiagramInstancePayload<T>),
            instanceId: getDiagramInstanceId((payload as DiagramInstancePayload<T>).instanceId),
        };
    }

    return {
        instanceId: getDiagramInstanceId(),
        value: payload as T,
    };
};

const projectDiagramFeatureSliceInternal = createSlice({
    name: "diagram",
    initialState,
    reducers: {
        initializeInstance(
            state, //
            action: PayloadAction<InitializeDiagramInstancePayload>
        ) {
            const resolvedInstanceId = getDiagramInstanceId(action.payload.instanceId);
            const existingInstanceState = state.instances[resolvedInstanceId];

            if (!existingInstanceState) {
                state.instances[resolvedInstanceId] = {
                    ...createInitialDiagramInstanceState(),
                    ...action.payload.initialState,
                };
                return;
            }

            Object.assign(existingInstanceState, {
                ...action.payload.initialState,
                ...existingInstanceState,
            });
        },
        removeInstance(
            state, //
            action: PayloadAction<string>
        ) {
            const resolvedInstanceId = getDiagramInstanceId(action.payload);
            delete state.instances[resolvedInstanceId];
        },
        setDiagramView(
            state, //
            action: PayloadAction<DiagramView>
        ) {
            state.diagramView = action.payload;
        },
        setDraftCanvasId(
            state, //
            action: PayloadAction<string | DiagramInstancePayload<string>>
        ) {
            const { instanceId, value } = getDiagramPayload(action.payload);
            const instanceState = ensureDiagramInstance(state, instanceId);

            if (instanceState.draftCanvasId === value) {
                return;
            }

            instanceState.draftCanvasId = value;
            instanceState.draftCanvas = undefined;
            instanceState.overlayEdges = [];
            instanceState.overlayNodes = [];
            instanceState.selectedEdgeIdList = [];
            instanceState.selectedNodeIdList = [];
        },
        setJoyrideViewType(
            state,
            action: PayloadAction<CanvasType | DiagramInstancePayload<CanvasType>>
        ) {
            const { instanceId, value } = getDiagramPayload(action.payload);
            ensureDiagramInstance(state, instanceId).joyrideViewType = value;
        },
        setCapabilities(
            state,
            action: PayloadAction<DiagramInstancePayload<DiagramCapabilitiesState>>
        ) {
            const { instanceId, value } = getDiagramPayload(action.payload);
            ensureDiagramInstance(state, instanceId).capabilities = value;
        },
        setCanvasHistory(
            state, //
            action: PayloadAction<SetDiagramCanvasHistoryPayload>
        ) {
            const { instanceId, value } = getDiagramPayload(action.payload);
            ensureDiagramInstance(state, instanceId).canvasHistory = value;
        },
        setCanvasHistoryIndex(
            state, //
            action: PayloadAction<number | DiagramInstancePayload<number>>
        ) {
            const { instanceId, value } = getDiagramPayload(action.payload);
            ensureDiagramInstance(state, instanceId).canvasHistoryIndex = value;
        },
        setSelectedNodeIdList(
            state, //
            action: PayloadAction<string[] | DiagramInstancePayload<string[]>>
        ) {
            const { instanceId, value } = getDiagramPayload(action.payload);
            ensureDiagramInstance(state, instanceId).selectedNodeIdList = value;
        },
        setSelectedEdgeIdList(
            state, //
            action: PayloadAction<string[] | DiagramInstancePayload<string[]>>
        ) {
            const { instanceId, value } = getDiagramPayload(action.payload);
            ensureDiagramInstance(state, instanceId).selectedEdgeIdList = value;
        },
        setMiniMapExpanded(
            state, //
            action: PayloadAction<boolean | DiagramInstancePayload<boolean>>
        ) {
            const { instanceId, value } = getDiagramPayload(action.payload);
            ensureDiagramInstance(state, instanceId).miniMapExpanded = value;
        },
        setSetupSelectedOption(
            state, //
            action: PayloadAction<string | DiagramInstancePayload<string>>
        ) {
            const { instanceId, value } = getDiagramPayload(action.payload);
            ensureDiagramInstance(state, instanceId).setupSelectedOption = value;
        },
        setSetupPendingSelectedOption(
            state, //
            action: PayloadAction<string | DiagramInstancePayload<string>>
        ) {
            const { instanceId, value } = getDiagramPayload(action.payload);
            ensureDiagramInstance(state, instanceId).setupPendingSelectedOption = value;
        },
        setSetupSelectedTemplateCanvasId(
            state, //
            action: PayloadAction<string | DiagramInstancePayload<string>>
        ) {
            const { instanceId, value } = getDiagramPayload(action.payload);
            ensureDiagramInstance(state, instanceId).setupSelectedTemplateCanvasId = value;
        },
        setSetupNaturalLanguageDescription(
            state, //
            action: PayloadAction<string | DiagramInstancePayload<string>>
        ) {
            const { instanceId, value } = getDiagramPayload(action.payload);
            ensureDiagramInstance(state, instanceId).setupNaturalLanguageDescription = value;
        },
        setUserStoryPendingSelectedDataNodesMapping(
            state,
            action: PayloadAction<
                | Record<string, OptionLabel[]>
                | DiagramInstancePayload<Record<string, OptionLabel[]>>
            >
        ) {
            const { instanceId, value } = getDiagramPayload(action.payload);
            ensureDiagramInstance(state, instanceId).userStoryPendingSelectedDataNodesMapping =
                value;
        },
        setUserStoryNodesPositionApplyToAll(
            state,
            action: PayloadAction<boolean | DiagramInstancePayload<boolean>>
        ) {
            const { instanceId, value } = getDiagramPayload(action.payload);
            ensureDiagramInstance(state, instanceId).userStoryNodesPositionApplyToAll = value;
        },
        setUserStoryCanvasColumnButtonSelectedPositionMapping(
            state,
            action: PayloadAction<
                | Record<string, CanvasColumn | undefined>
                | DiagramInstancePayload<Record<string, CanvasColumn | undefined>>
            >
        ) {
            const { instanceId, value } = getDiagramPayload(action.payload);
            ensureDiagramInstance(
                state,
                instanceId
            ).userStoryCanvasColumnButtonSelectedPositionMapping = value;
        },
        setHiddenEdgeIds(
            state, //
            action: PayloadAction<string[] | DiagramInstancePayload<string[]>>
        ) {
            const { instanceId, value } = getDiagramPayload(action.payload);
            ensureDiagramInstance(state, instanceId).hiddenEdgeIds = value;
        },
        setWarningListMapping(
            state, //
            action: PayloadAction<
                WarningMessageMapping | DiagramInstancePayload<WarningMessageMapping>
            >
        ) {
            const { instanceId, value } = getDiagramPayload(action.payload);
            ensureDiagramInstance(state, instanceId).warningListMapping = value;
        },
        setToscaReportMapping(
            state, //
            action: PayloadAction<
                | { [id: string]: WarningReport[] }
                | DiagramInstancePayload<{ [id: string]: WarningReport[] }>
            >
        ) {
            const { instanceId, value } = getDiagramPayload(action.payload);
            ensureDiagramInstance(state, instanceId).toscaReportMapping = value;
        },
        setWarningFilterKey(state, action: PayloadAction<string | DiagramInstancePayload<string>>) {
            const { instanceId, value } = getDiagramPayload(action.payload);
            ensureDiagramInstance(state, instanceId).warningFilterKey = value;
        },
        setWarningSortDirection(
            state, //
            action: PayloadAction<SortDirection | DiagramInstancePayload<SortDirection>>
        ) {
            const { instanceId, value } = getDiagramPayload(action.payload);
            ensureDiagramInstance(state, instanceId).warningSortDirection = value;
        },
        setWarningSortCriteria(
            state, //
            action: PayloadAction<string | DiagramInstancePayload<string>>
        ) {
            const { instanceId, value } = getDiagramPayload(action.payload);
            ensureDiagramInstance(state, instanceId).warningSortCriteria = value;
        },
        setHiddenWarningIdList(
            state, //
            action: PayloadAction<string[] | DiagramInstancePayload<string[]>>
        ) {
            const { instanceId, value } = getDiagramPayload(action.payload);
            ensureDiagramInstance(state, instanceId).hiddenWarningIdList = value;
        },
        setWarningList(
            state, //
            action: PayloadAction<WarningMessage[] | DiagramInstancePayload<WarningMessage[]>>
        ) {
            const { instanceId, value } = getDiagramPayload(action.payload);
            ensureDiagramInstance(state, instanceId).warningList = value;
        },
        setIsConnecting(
            state, //
            action: PayloadAction<boolean | DiagramInstancePayload<boolean>>
        ) {
            const { instanceId, value } = getDiagramPayload(action.payload);
            ensureDiagramInstance(state, instanceId).isConnecting = value;
        },
        setIsConnectingHandleType(
            state, //
            action: PayloadAction<HandleType | DiagramInstancePayload<HandleType>>
        ) {
            const { instanceId, value } = getDiagramPayload(action.payload);
            ensureDiagramInstance(state, instanceId).isConnectingHandleType = value;
        },
        setDraftCanvas(
            state, //
            action: PayloadAction<
                DiagramCanvas | undefined | DiagramInstancePayload<DiagramCanvas | undefined>
            >
        ) {
            const { instanceId, value } = getDiagramPayload(action.payload);
            ensureDiagramInstance(state, instanceId).draftCanvas = value;
        },
        setDraftNode(
            state, //
            action: PayloadAction<SetDiagramNodePayload>
        ) {
            const { instanceId, value } = getDiagramPayload(action.payload);
            ensureDiagramInstance(state, instanceId).draftNode = value;
        },
        setDraftEdge(
            state, //
            action: PayloadAction<SetDiagramEdgePayload>
        ) {
            const { instanceId, value } = getDiagramPayload(action.payload);
            ensureDiagramInstance(state, instanceId).draftEdge = value;
        },
        setDraftNodeLabel(
            state, //
            action: PayloadAction<SetDiagramStringPayload>
        ) {
            const { instanceId, value } = getDiagramPayload(action.payload);
            ensureDiagramInstance(state, instanceId).draftNodeLabel = value;
        },
        setDraftEdgeLabel(
            state, //
            action: PayloadAction<SetDiagramStringPayload>
        ) {
            const { instanceId, value } = getDiagramPayload(action.payload);
            ensureDiagramInstance(state, instanceId).draftEdgeLabel = value;
        },
        setDraftNodeAttributes(
            state, //
            action: PayloadAction<SetDiagramElementAttributesPayload>
        ) {
            const { instanceId, value } = getDiagramPayload(action.payload);
            ensureDiagramInstance(state, instanceId).draftNodeAttributes = value;
        },
        setDraftEdgeAttributes(
            state, //
            action: PayloadAction<SetDiagramElementAttributesPayload>
        ) {
            const { instanceId, value } = getDiagramPayload(action.payload);
            ensureDiagramInstance(state, instanceId).draftEdgeAttributes = value;
        },
        setDraftNodeLoaded(
            state, //
            action: PayloadAction<SetDiagramBooleanPayload>
        ) {
            const { instanceId, value } = getDiagramPayload(action.payload);
            ensureDiagramInstance(state, instanceId).draftNodeLoaded = value;
        },
        setDraftEdgeLoaded(
            state, //
            action: PayloadAction<SetDiagramBooleanPayload>
        ) {
            const { instanceId, value } = getDiagramPayload(action.payload);
            ensureDiagramInstance(state, instanceId).draftEdgeLoaded = value;
        },
        setIsNodeDrawerDirty(
            state, //
            action: PayloadAction<SetDiagramBooleanPayload>
        ) {
            const { instanceId, value } = getDiagramPayload(action.payload);
            ensureDiagramInstance(state, instanceId).isNodeDrawerDirty = value;
        },
        setIsEdgeDrawerDirty(
            state, //
            action: PayloadAction<SetDiagramBooleanPayload>
        ) {
            const { instanceId, value } = getDiagramPayload(action.payload);
            ensureDiagramInstance(state, instanceId).isEdgeDrawerDirty = value;
        },
        setViewSelectDisabled(
            state, //
            action: PayloadAction<boolean | DiagramInstancePayload<boolean>>
        ) {
            const { instanceId, value } = getDiagramPayload(action.payload);
            ensureDiagramInstance(state, instanceId).viewSelectDisabled = value;
        },
        setBackendSaveEnabled(
            state, //
            action: PayloadAction<boolean | DiagramInstancePayload<boolean>>
        ) {
            const { instanceId, value } = getDiagramPayload(action.payload);
            ensureDiagramInstance(state, instanceId).backendSaveEnabled = value;
        },
        setInTransition(
            state, //
            action: PayloadAction<boolean>
        ) {
            state.inTransition = action.payload;
        },
        setPendingDrawerKey(
            state, //
            action: PayloadAction<
                DiagramPendingDrawerKey | DiagramInstancePayload<DiagramPendingDrawerKey>
            >
        ) {
            const { instanceId, value } = getDiagramPayload(action.payload);
            ensureDiagramInstance(state, instanceId).pendingDrawerKey = value;
        },
        setRequestedThreatScenarioDrawerKey(
            state, //
            action: PayloadAction<
                | DiagramRequestedThreatScenarioDrawerKey
                | DiagramInstancePayload<DiagramRequestedThreatScenarioDrawerKey>
            >
        ) {
            const { instanceId, value } = getDiagramPayload(action.payload);
            ensureDiagramInstance(state, instanceId).requestedThreatScenarioDrawerKey = value;
        },
        setBiDirectionalArrow(
            state, //
            action: PayloadAction<boolean | DiagramInstancePayload<boolean>>
        ) {
            const { instanceId, value } = getDiagramPayload(action.payload);
            ensureDiagramInstance(state, instanceId).biDirectionalArrow = value;
        },
        setEdges(
            state, //
            action: PayloadAction<DiagramEdge[] | DiagramInstancePayload<DiagramEdge[]>>
        ) {
            const { instanceId, value } = getDiagramPayload(action.payload);
            const instanceState = ensureDiagramInstance(state, instanceId);
            if (!instanceState.draftCanvas) {
                return;
            }
            instanceState.draftCanvas.edges = value;
        },
        setNodes(
            state, //
            action: PayloadAction<DiagramNode[] | DiagramInstancePayload<DiagramNode[]>>
        ) {
            const { instanceId, value } = getDiagramPayload(action.payload);
            const instanceState = ensureDiagramInstance(state, instanceId);
            if (!instanceState.draftCanvas) {
                return;
            }
            instanceState.draftCanvas.nodes = value;
        },
        setOverlayEdges(
            state, //
            action: PayloadAction<DiagramEdge[] | DiagramInstancePayload<DiagramEdge[]>>
        ) {
            const { instanceId, value } = getDiagramPayload(action.payload);
            ensureDiagramInstance(state, instanceId).overlayEdges = value;
        },
        setOverlayNodes(
            state, //
            action: PayloadAction<DiagramNode[] | DiagramInstancePayload<DiagramNode[]>>
        ) {
            const { instanceId, value } = getDiagramPayload(action.payload);
            ensureDiagramInstance(state, instanceId).overlayNodes = value;
        },
        setLineSegments(
            state, //
            action: PayloadAction<
                | Record<string, LineSegment[]>
                | DiagramInstancePayload<Record<string, LineSegment[]>>
            >
        ) {
            const { instanceId, value } = getDiagramPayload(action.payload);
            ensureDiagramInstance(state, instanceId).lineSegments = value;
        },
        setEdgeSegmentedPaths(
            state, //
            action: PayloadAction<
                Record<string, string> | DiagramInstancePayload<Record<string, string>>
            >
        ) {
            const { instanceId, value } = getDiagramPayload(action.payload);
            ensureDiagramInstance(state, instanceId).edgeSegmentedPaths = value;
        },
        setNodeHandleEdgeMapping(
            state, //
            action: PayloadAction<
                NodeHandleEdgeMappingDict | DiagramInstancePayload<NodeHandleEdgeMappingDict>
            >
        ) {
            const { instanceId, value } = getDiagramPayload(action.payload);
            ensureDiagramInstance(state, instanceId).nodeHandleEdgeMapping = value;
        },
        setCanvasInit(
            state, //
            action: PayloadAction<boolean | DiagramInstancePayload<boolean>>
        ) {
            const { instanceId, value } = getDiagramPayload(action.payload);
            ensureDiagramInstance(state, instanceId).canvasInit = value;
        },
        setSelectedPathId(
            state, //
            action: PayloadAction<string | DiagramInstancePayload<string>>
        ) {
            const { instanceId, value } = getDiagramPayload(action.payload);
            ensureDiagramInstance(state, instanceId).selectedPathId = value;
        },
        setPathSelectDisabled(
            state, //
            action: PayloadAction<boolean | DiagramInstancePayload<boolean>>
        ) {
            const { instanceId, value } = getDiagramPayload(action.payload);
            ensureDiagramInstance(state, instanceId).pathSelectDisabled = value;
        },
        settargetNodeId(
            state, //
            action: PayloadAction<string | DiagramInstancePayload<string>>
        ) {
            const { instanceId, value } = getDiagramPayload(action.payload);
            ensureDiagramInstance(state, instanceId).targetNodeId = value;
        },
        settargetEdgeId(
            state, //
            action: PayloadAction<string | DiagramInstancePayload<string>>
        ) {
            const { instanceId, value } = getDiagramPayload(action.payload);
            ensureDiagramInstance(state, instanceId).targetEdgeId = value;
        },
        settargetNodePulseToken(
            state, //
            action: PayloadAction<number | DiagramInstancePayload<number>>
        ) {
            const { instanceId, value } = getDiagramPayload(action.payload);
            ensureDiagramInstance(state, instanceId).targetNodePulseToken = value;
        },
        settargetEdgePulseToken(
            state, //
            action: PayloadAction<number | DiagramInstancePayload<number>>
        ) {
            const { instanceId, value } = getDiagramPayload(action.payload);
            ensureDiagramInstance(state, instanceId).targetEdgePulseToken = value;
        },
        setStepNumber(state, action: PayloadAction<number | DiagramInstancePayload<number>>) {
            const { instanceId, value } = getDiagramPayload(action.payload);
            ensureDiagramInstance(state, instanceId).stepNumber = value;
        },
        setViewNodeDetails(
            state, //
            action: PayloadAction<boolean | DiagramInstancePayload<boolean>>
        ) {
            const { instanceId, value } = getDiagramPayload(action.payload);
            ensureDiagramInstance(state, instanceId).viewNodeDetails = value;
        },
        setViewEdgeDetails(
            state, //
            action: PayloadAction<boolean | DiagramInstancePayload<boolean>>
        ) {
            const { instanceId, value } = getDiagramPayload(action.payload);
            ensureDiagramInstance(state, instanceId).viewEdgeDetails = value;
        },
        setSelectedTabGroup(
            state, //
            action: PayloadAction<string | DiagramInstancePayload<string>>
        ) {
            const { instanceId, value } = getDiagramPayload(action.payload);
            ensureDiagramInstance(state, instanceId).selectedTabGroup = value;
        },
        setSelectedDataflowCanvasId(
            state,
            action: PayloadAction<string | DiagramInstancePayload<string>>
        ) {
            const { instanceId, value } = getDiagramPayload(action.payload);
            ensureDiagramInstance(state, instanceId).selectedDataflowCanvasId = value;
        },
        setEditToolbarState(
            state, //
            action: PayloadAction<SetDiagramEditToolbarStatePayload>
        ) {
            const { instanceId, value } = getDiagramPayload(action.payload);
            ensureDiagramInstance(state, instanceId).editToolbarState = value;
        },
        setDrawerState(
            state, //
            action: PayloadAction<DrawerState | DiagramInstancePayload<DrawerState>>
        ) {
            const { instanceId, value } = getDiagramPayload(action.payload);
            ensureDiagramInstance(state, instanceId).drawerState = value;
        },
        setResourceDrawerSelected(
            state, //
            action: PayloadAction<OptionLabel | DiagramInstancePayload<OptionLabel>>
        ) {
            const { instanceId, value } = getDiagramPayload(action.payload);
            ensureDiagramInstance(state, instanceId).resourceDrawerSelected = value;
        },
        setResourceDrawerSearchStrings(
            state, //
            action: PayloadAction<string[] | DiagramInstancePayload<string[]>>
        ) {
            const { instanceId, value } = getDiagramPayload(action.payload);
            ensureDiagramInstance(state, instanceId).resourceDrawerSearchStrings = value;
        },
        setResourceDrawerViewMode(
            state, //
            action: PayloadAction<
                ResourceDrawerViewMode | DiagramInstancePayload<ResourceDrawerViewMode>
            >
        ) {
            const { instanceId, value } = getDiagramPayload(action.payload);
            ensureDiagramInstance(state, instanceId).resourceDrawerViewMode = value;
        },
        setIsAttributeDrawerOpen(
            state, //
            action: PayloadAction<boolean | DiagramInstancePayload<boolean>>
        ) {
            const { instanceId, value } = getDiagramPayload(action.payload);
            ensureDiagramInstance(state, instanceId).isAttributeDrawerOpen = value;
        },
        setSelectedAttackStep(
            state, //
            action: PayloadAction<AttackStep | DiagramInstancePayload<AttackStep>>
        ) {
            const { instanceId, value } = getDiagramPayload(action.payload);
            ensureDiagramInstance(state, instanceId).selectedAttackStep = value;
        },
        setNodeAttackStepCountMapping(
            state, //
            action: PayloadAction<
                NodeAttackStepCountMapping | DiagramInstancePayload<NodeAttackStepCountMapping>
            >
        ) {
            const { instanceId, value } = getDiagramPayload(action.payload);
            ensureDiagramInstance(state, instanceId).nodeAttackStepCountMapping = value;
        },
        setNodeAttackPathMapping(
            state, //
            action: PayloadAction<
                NodeAttackPathMapping | DiagramInstancePayload<NodeAttackPathMapping>
            >
        ) {
            const { instanceId, value } = getDiagramPayload(action.payload);
            ensureDiagramInstance(state, instanceId).nodeAttackPathMapping = value;
        },
        setViewAllPaths(
            state, //
            action: PayloadAction<boolean | DiagramInstancePayload<boolean>>
        ) {
            const { instanceId, value } = getDiagramPayload(action.payload);
            ensureDiagramInstance(state, instanceId).viewAllPaths = value;
        },
        setPendingThreatOverviewScenarioScope(
            state, //
            action: PayloadAction<
                ("top5" | "all" | null) | DiagramInstancePayload<"top5" | "all" | null>
            >
        ) {
            const { instanceId, value } = getDiagramPayload(action.payload);
            ensureDiagramInstance(state, instanceId).pendingThreatOverviewScenarioScope = value;
        },
        setThreatOverviewScenarioScope(
            state, //
            action: PayloadAction<("top5" | "all") | DiagramInstancePayload<"top5" | "all">>
        ) {
            const { instanceId, value } = getDiagramPayload(action.payload);
            ensureDiagramInstance(state, instanceId).threatOverviewScenarioScope = value;
        },
        setVisibleThreatScenarioCanvasIds(
            state, //
            action: PayloadAction<string[] | DiagramInstancePayload<string[]>>
        ) {
            const { instanceId, value } = getDiagramPayload(action.payload);
            ensureDiagramInstance(state, instanceId).visibleThreatScenarioCanvasIds = value;
        },
        setHideAllPaths(
            state, //
            action: PayloadAction<boolean | DiagramInstancePayload<boolean>>
        ) {
            const { instanceId, value } = getDiagramPayload(action.payload);
            ensureDiagramInstance(state, instanceId).hideAllPaths = value;
        },
        setStartAttackPath(
            state, //
            action: PayloadAction<boolean | DiagramInstancePayload<boolean>>
        ) {
            const { instanceId, value } = getDiagramPayload(action.payload);
            ensureDiagramInstance(state, instanceId).startAttackPath = value;
        },
        setThreatScenarioExpandedFrameworkKeys(
            state,
            action: PayloadAction<string[] | DiagramInstancePayload<string[]>>
        ) {
            const { instanceId, value } = getDiagramPayload(action.payload);
            ensureDiagramInstance(state, instanceId).threatScenarioExpandedFrameworkKeys = value;
        },
        setAttackPathSelectionFieldContentHeights(
            state,
            action: PayloadAction<
                | { collapsed: number; expanded: number }
                | DiagramInstancePayload<{ collapsed: number; expanded: number }>
            >
        ) {
            const { instanceId, value } = getDiagramPayload(action.payload);
            ensureDiagramInstance(state, instanceId).attackPathSelectionFieldContentHeights = value;
        },
    },
});

const projectDiagramFeatureSlice: {
    reducer: Reducer<DiagramState>;
    actions: {
        initializeInstance: ActionCreatorWithPayload<
            InitializeDiagramInstancePayload,
            "diagram/initializeInstance"
        >;
        removeInstance: ActionCreatorWithPayload<
            string, //
            "diagram/removeInstance"
        >;
        setDiagramView: ActionCreatorWithPayload<
            DiagramView, //
            "diagram/setDiagramView"
        >;
        setDraftCanvasId: ActionCreatorWithPayload<
            SetDiagramStringPayload,
            "diagram/setDraftCanvasId"
        >;
        setJoyrideViewType: ActionCreatorWithPayload<
            CanvasType | DiagramInstancePayload<CanvasType>,
            "diagram/setJoyrideViewType"
        >;
        setCanvasHistory: ActionCreatorWithPayload<
            SetDiagramCanvasHistoryPayload,
            "diagram/setCanvasHistory"
        >;
        setCanvasHistoryIndex: ActionCreatorWithPayload<
            SetDiagramNumberPayload,
            "diagram/setCanvasHistoryIndex"
        >;
        setSelectedNodeIdList: ActionCreatorWithPayload<
            SetDiagramStringArrayPayload,
            "diagram/setSelectedNodeIdList"
        >;
        setSelectedEdgeIdList: ActionCreatorWithPayload<
            SetDiagramStringArrayPayload,
            "diagram/setSelectedEdgeIdList"
        >;
        setMiniMapExpanded: ActionCreatorWithPayload<
            SetDiagramBooleanPayload,
            "diagram/setMiniMapExpanded"
        >;
        setSetupSelectedOption: ActionCreatorWithPayload<
            SetDiagramStringPayload,
            "diagram/setSetupSelectedOption"
        >;
        setSetupPendingSelectedOption: ActionCreatorWithPayload<
            SetDiagramStringPayload,
            "diagram/setSetupPendingSelectedOption"
        >;
        setSetupSelectedTemplateCanvasId: ActionCreatorWithPayload<
            SetDiagramStringPayload,
            "diagram/setSetupSelectedTemplateCanvasId"
        >;
        setSetupNaturalLanguageDescription: ActionCreatorWithPayload<
            SetDiagramStringPayload,
            "diagram/setSetupNaturalLanguageDescription"
        >;
        setUserStoryPendingSelectedDataNodesMapping: ActionCreatorWithPayload<
            SetDiagramOptionLabelArrayMappingPayload,
            "diagram/setUserStoryPendingSelectedDataNodesMapping"
        >;
        setUserStoryNodesPositionApplyToAll: ActionCreatorWithPayload<
            SetDiagramBooleanPayload,
            "diagram/setUserStoryNodesPositionApplyToAll"
        >;
        setUserStoryCanvasColumnButtonSelectedPositionMapping: ActionCreatorWithPayload<
            SetDiagramCanvasColumnMappingPayload,
            "diagram/setUserStoryCanvasColumnButtonSelectedPositionMapping"
        >;
        setHiddenEdgeIds: ActionCreatorWithPayload<
            SetDiagramStringArrayPayload,
            "diagram/setHiddenEdgeIds"
        >;
        setWarningListMapping: ActionCreatorWithPayload<
            SetDiagramWarningMessageMappingPayload,
            "diagram/setWarningListMapping"
        >;
        setToscaReportMapping: ActionCreatorWithPayload<
            SetDiagramToscaReportMappingPayload,
            "diagram/setToscaReportMapping"
        >;
        setWarningFilterKey: ActionCreatorWithPayload<
            SetDiagramStringPayload,
            "diagram/setWarningFilterKey"
        >;
        setWarningSortDirection: ActionCreatorWithPayload<
            SortDirection | DiagramInstancePayload<SortDirection>,
            "diagram/setWarningSortDirection"
        >;
        setWarningSortCriteria: ActionCreatorWithPayload<
            SetDiagramStringPayload,
            "diagram/setWarningSortCriteria"
        >;
        setHiddenWarningIdList: ActionCreatorWithPayload<
            SetDiagramStringArrayPayload,
            "diagram/setHiddenWarningIdList"
        >;
        setWarningList: ActionCreatorWithPayload<
            SetDiagramWarningMessageListPayload,
            "diagram/setWarningList"
        >;
        setIsConnecting: ActionCreatorWithPayload<
            SetDiagramBooleanPayload,
            "diagram/setIsConnecting"
        >;
        setIsConnectingHandleType: ActionCreatorWithPayload<
            HandleType | DiagramInstancePayload<HandleType>,
            "diagram/setIsConnectingHandleType"
        >;
        setDraftCanvas: ActionCreatorWithPayload<
            SetDiagramCanvasPayload, //
            "diagram/setDraftCanvas"
        >;
        setDraftNode: ActionCreatorWithPayload<
            SetDiagramNodePayload, //
            "diagram/setDraftNode"
        >;
        setDraftEdge: ActionCreatorWithPayload<
            SetDiagramEdgePayload, //
            "diagram/setDraftEdge"
        >;
        setDraftNodeLabel: ActionCreatorWithPayload<
            SetDiagramStringPayload,
            "diagram/setDraftNodeLabel"
        >;
        setDraftEdgeLabel: ActionCreatorWithPayload<
            SetDiagramStringPayload,
            "diagram/setDraftEdgeLabel"
        >;
        setDraftNodeAttributes: ActionCreatorWithPayload<
            SetDiagramElementAttributesPayload,
            "diagram/setDraftNodeAttributes"
        >;
        setDraftEdgeAttributes: ActionCreatorWithPayload<
            SetDiagramElementAttributesPayload,
            "diagram/setDraftEdgeAttributes"
        >;
        setDraftNodeLoaded: ActionCreatorWithPayload<
            SetDiagramBooleanPayload,
            "diagram/setDraftNodeLoaded"
        >;
        setDraftEdgeLoaded: ActionCreatorWithPayload<
            SetDiagramBooleanPayload,
            "diagram/setDraftEdgeLoaded"
        >;
        setIsNodeDrawerDirty: ActionCreatorWithPayload<
            SetDiagramBooleanPayload,
            "diagram/setIsNodeDrawerDirty"
        >;
        setIsEdgeDrawerDirty: ActionCreatorWithPayload<
            SetDiagramBooleanPayload,
            "diagram/setIsEdgeDrawerDirty"
        >;
        setViewSelectDisabled: ActionCreatorWithPayload<
            SetDiagramBooleanPayload,
            "diagram/setViewSelectDisabled"
        >;
        setBackendSaveEnabled: ActionCreatorWithPayload<
            SetDiagramBooleanPayload,
            "diagram/setBackendSaveEnabled"
        >;
        setInTransition: ActionCreatorWithPayload<
            boolean, //
            "diagram/setInTransition"
        >;
        setPendingDrawerKey: ActionCreatorWithPayload<
            SetDiagramPendingDrawerKeyPayload,
            "diagram/setPendingDrawerKey"
        >;
        setRequestedThreatScenarioDrawerKey: ActionCreatorWithPayload<
            SetDiagramRequestedThreatScenarioDrawerKeyPayload,
            "diagram/setRequestedThreatScenarioDrawerKey"
        >;
        setBiDirectionalArrow: ActionCreatorWithPayload<
            SetDiagramBooleanPayload,
            "diagram/setBiDirectionalArrow"
        >;
        setEdges: ActionCreatorWithPayload<
            SetDiagramEdgesPayload, //
            "diagram/setEdges"
        >;
        setNodes: ActionCreatorWithPayload<
            SetDiagramNodesPayload, //
            "diagram/setNodes"
        >;
        setOverlayEdges: ActionCreatorWithPayload<
            SetDiagramEdgesPayload,
            "diagram/setOverlayEdges"
        >;
        setOverlayNodes: ActionCreatorWithPayload<
            SetDiagramNodesPayload,
            "diagram/setOverlayNodes"
        >;
        setLineSegments: ActionCreatorWithPayload<
            SetDiagramLineSegmentsPayload,
            "diagram/setLineSegments"
        >;
        setEdgeSegmentedPaths: ActionCreatorWithPayload<
            SetDiagramEdgeSegmentedPathsPayload,
            "diagram/setEdgeSegmentedPaths"
        >;
        setNodeHandleEdgeMapping: ActionCreatorWithPayload<
            SetDiagramNodeHandleEdgeMappingPayload,
            "diagram/setNodeHandleEdgeMapping"
        >;
        setCanvasInit: ActionCreatorWithPayload<
            SetDiagramBooleanPayload, //
            "diagram/setCanvasInit"
        >;
        setSelectedPathId: ActionCreatorWithPayload<
            SetDiagramStringPayload,
            "diagram/setSelectedPathId"
        >;
        setPathSelectDisabled: ActionCreatorWithPayload<
            SetDiagramBooleanPayload,
            "diagram/setPathSelectDisabled"
        >;
        settargetNodeId: ActionCreatorWithPayload<
            SetDiagramStringPayload,
            "diagram/settargetNodeId"
        >;
        settargetEdgeId: ActionCreatorWithPayload<
            SetDiagramStringPayload,
            "diagram/settargetEdgeId"
        >;
        settargetNodePulseToken: ActionCreatorWithPayload<
            SetDiagramNumberPayload,
            "diagram/settargetNodePulseToken"
        >;
        settargetEdgePulseToken: ActionCreatorWithPayload<
            SetDiagramNumberPayload,
            "diagram/settargetEdgePulseToken"
        >;
        setStepNumber: ActionCreatorWithPayload<SetDiagramNumberPayload, "diagram/setStepNumber">;
        setViewNodeDetails: ActionCreatorWithPayload<
            SetDiagramBooleanPayload,
            "diagram/setViewNodeDetails"
        >;
        setViewEdgeDetails: ActionCreatorWithPayload<
            SetDiagramBooleanPayload,
            "diagram/setViewEdgeDetails"
        >;
        setSelectedTabGroup: ActionCreatorWithPayload<
            SetDiagramStringPayload,
            "diagram/setSelectedTabGroup"
        >;
        setSelectedDataflowCanvasId: ActionCreatorWithPayload<
            SetDiagramStringPayload,
            "diagram/setSelectedDataflowCanvasId"
        >;
        setEditToolbarState: ActionCreatorWithPayload<
            SetDiagramEditToolbarStatePayload,
            "diagram/setEditToolbarState"
        >;
        setDrawerState: ActionCreatorWithPayload<
            SetDiagramDrawerStatePayload,
            "diagram/setDrawerState"
        >;
        setResourceDrawerSelected: ActionCreatorWithPayload<
            SetDiagramOptionLabelPayload,
            "diagram/setResourceDrawerSelected"
        >;
        setResourceDrawerSearchStrings: ActionCreatorWithPayload<
            SetDiagramStringArrayPayload,
            "diagram/setResourceDrawerSearchStrings"
        >;
        setResourceDrawerViewMode: ActionCreatorWithPayload<
            ResourceDrawerViewMode | DiagramInstancePayload<ResourceDrawerViewMode>,
            "diagram/setResourceDrawerViewMode"
        >;
        setIsAttributeDrawerOpen: ActionCreatorWithPayload<
            SetDiagramBooleanPayload,
            "diagram/setIsAttributeDrawerOpen"
        >;
        setSelectedAttackStep: ActionCreatorWithPayload<
            SetDiagramAttackStepPayload,
            "diagram/setSelectedAttackStep"
        >;
        setNodeAttackStepCountMapping: ActionCreatorWithPayload<
            SetDiagramAttackStepCountMappingPayload,
            "diagram/setNodeAttackStepCountMapping"
        >;
        setNodeAttackPathMapping: ActionCreatorWithPayload<
            SetDiagramAttackPathMappingPayload,
            "diagram/setNodeAttackPathMapping"
        >;
        setViewAllPaths: ActionCreatorWithPayload<
            SetDiagramBooleanPayload,
            "diagram/setViewAllPaths"
        >;
        setPendingThreatOverviewScenarioScope: ActionCreatorWithPayload<
            SetDiagramPendingThreatOverviewScenarioScopePayload,
            "diagram/setPendingThreatOverviewScenarioScope"
        >;
        setThreatOverviewScenarioScope: ActionCreatorWithPayload<
            ("top5" | "all") | DiagramInstancePayload<"top5" | "all">,
            "diagram/setThreatOverviewScenarioScope"
        >;
        setVisibleThreatScenarioCanvasIds: ActionCreatorWithPayload<
            SetDiagramStringArrayPayload,
            "diagram/setVisibleThreatScenarioCanvasIds"
        >;
        setHideAllPaths: ActionCreatorWithPayload<
            SetDiagramBooleanPayload,
            "diagram/setHideAllPaths"
        >;
        setStartAttackPath: ActionCreatorWithPayload<
            SetDiagramBooleanPayload,
            "diagram/setStartAttackPath"
        >;
        setThreatScenarioExpandedFrameworkKeys: ActionCreatorWithPayload<
            SetDiagramStringArrayPayload,
            "diagram/setThreatScenarioExpandedFrameworkKeys"
        >;
        setAttackPathSelectionFieldContentHeights: ActionCreatorWithPayload<
            | { collapsed: number; expanded: number }
            | DiagramInstancePayload<{ collapsed: number; expanded: number }>,
            "diagram/setAttackPathSelectionFieldContentHeights"
        >;
        setCapabilities: ActionCreatorWithPayload<
            DiagramInstancePayload<DiagramCapabilitiesState>,
            "diagram/setCapabilities"
        >;
    };
} = projectDiagramFeatureSliceInternal;

export default projectDiagramFeatureSlice;
