import {
    DEFAULT_DIAGRAM_EDIT_TOOLBAR_STATE,
    EMPTY_DIAGRAM_CANVAS_HISTORY,
    EMPTY_DIAGRAM_EDGE_SEGMENTED_PATHS,
    EMPTY_DIAGRAM_LINE_SEGMENTS,
    EMPTY_NODE_HANDLE_EDGE_MAPPING,
    EMPTY_TOSCA_REPORT_MAPPING,
} from "#root/constants/diagram";
import { DiagramCanvas } from "#root/interfaces/diagram";
import type { DiagramCapabilitiesState, DiagramInstanceState } from "#root/interfaces/redux";
import { InstanceStateResolver } from "#root/lib/InstanceStateResolver";
import { createInitialDiagramInstanceState } from "#root/redux/projectDiagramFeatureSlice";
import { RootState } from "#root/redux/store";
import { selectBackendProjectDiagram } from "#root/selectors/backendSelectors";
import { getSelectedCanvas } from "#root/utils/diagram/backendDiagramUtil";
import { ensureProjectFeatureInstanceId } from "#root/utils/projectInstanceId";

// ====================
// Root Diagram State
// ====================

const selectDiagramState = (
    state: RootState //
) => state.diagram.instances;

export const selectDiagramView = (state: RootState) => state.diagram.diagramView;

// ====================
// Instance State Resolver
// ====================

export const selectDiagramInstanceState = (
    state: RootState,
    instanceId?: string
): DiagramInstanceState => {
    return InstanceStateResolver.resolve({
        instances: selectDiagramState(state),
        instanceId: ensureProjectFeatureInstanceId({
            featureKey: "diagram",
            instanceId,
        }),
        createInitialState: createInitialDiagramInstanceState,
    });
};

// ====================
// Instance State Accessors
// ====================

export const selectDraftCanvasId = (
    state: RootState, //
    instanceId?: string
) => {
    const diagramInstanceState = selectDiagramInstanceState(state, instanceId);
    return diagramInstanceState.draftCanvasId;
};

export const selectDiagramCanvasHistory = (state: RootState, instanceId?: string) => {
    const diagramInstanceState = selectDiagramInstanceState(state, instanceId);
    return diagramInstanceState.canvasHistory ?? EMPTY_DIAGRAM_CANVAS_HISTORY;
};

export const selectDiagramCanvasHistoryIndex = (state: RootState, instanceId?: string) => {
    const diagramInstanceState = selectDiagramInstanceState(state, instanceId);
    return diagramInstanceState.canvasHistoryIndex;
};

export const selectSelectedNodeIdList = (
    state: RootState, //
    instanceId?: string
) => {
    const diagramInstanceState = selectDiagramInstanceState(state, instanceId);
    return diagramInstanceState.selectedNodeIdList;
};

export const selectSelectedEdgeIdList = (
    state: RootState, //
    instanceId?: string
) => {
    const diagramInstanceState = selectDiagramInstanceState(state, instanceId);
    return diagramInstanceState.selectedEdgeIdList;
};

export const selectDiagramMiniMapExpanded = (
    state: RootState, //
    instanceId?: string
) => {
    const diagramInstanceState = selectDiagramInstanceState(state, instanceId);
    return diagramInstanceState.miniMapExpanded;
};

export const selectDiagramSetupSelectedOption = (state: RootState, instanceId?: string) => {
    const diagramInstanceState = selectDiagramInstanceState(state, instanceId);
    return diagramInstanceState.setupSelectedOption;
};

export const selectDiagramSetupPendingSelectedOption = (state: RootState, instanceId?: string) => {
    const diagramInstanceState = selectDiagramInstanceState(state, instanceId);
    return diagramInstanceState.setupPendingSelectedOption;
};

export const selectDiagramSetupSelectedTemplateCanvasId = (
    state: RootState,
    instanceId?: string
) => {
    const diagramInstanceState = selectDiagramInstanceState(state, instanceId);
    return diagramInstanceState.setupSelectedTemplateCanvasId;
};

export const selectDiagramSetupNaturalLanguageDescription = (
    state: RootState,
    instanceId?: string
) => {
    const diagramInstanceState = selectDiagramInstanceState(state, instanceId);
    return diagramInstanceState.setupNaturalLanguageDescription;
};

export const selectDiagramUserStoryPendingSelectedDataNodesMapping = (
    state: RootState,
    instanceId?: string
) => {
    const diagramInstanceState = selectDiagramInstanceState(state, instanceId);
    return diagramInstanceState.userStoryPendingSelectedDataNodesMapping;
};

export const selectDiagramUserStoryNodesPositionApplyToAll = (
    state: RootState,
    instanceId?: string
) => {
    const diagramInstanceState = selectDiagramInstanceState(state, instanceId);
    return diagramInstanceState.userStoryNodesPositionApplyToAll;
};

export const selectDiagramUserStoryCanvasColumnButtonSelectedPositionMapping = (
    state: RootState,
    instanceId?: string
) => {
    const diagramInstanceState = selectDiagramInstanceState(state, instanceId);
    return diagramInstanceState.userStoryCanvasColumnButtonSelectedPositionMapping;
};

export const selectHiddenEdgeIds = (
    state: RootState, //
    instanceId?: string
) => {
    const diagramInstanceState = selectDiagramInstanceState(state, instanceId);
    return diagramInstanceState.hiddenEdgeIds;
};

export const selectWarningListMapping = (
    state: RootState, //
    instanceId?: string
) => {
    const diagramInstanceState = selectDiagramInstanceState(state, instanceId);
    return diagramInstanceState.warningListMapping;
};

export const selectDiagramToscaReportMapping = (
    state: RootState, //
    instanceId?: string
) => {
    const diagramInstanceState = selectDiagramInstanceState(state, instanceId);
    return diagramInstanceState.toscaReportMapping ?? EMPTY_TOSCA_REPORT_MAPPING;
};

export const selectWarningFilterKey = (
    state: RootState, //
    instanceId?: string
) => {
    const diagramInstanceState = selectDiagramInstanceState(state, instanceId);
    return diagramInstanceState.warningFilterKey;
};

export const selectWarningSortDirection = (
    state: RootState, //
    instanceId?: string
) => {
    const diagramInstanceState = selectDiagramInstanceState(state, instanceId);
    return diagramInstanceState.warningSortDirection;
};

export const selectWarningSortCriteria = (
    state: RootState, //
    instanceId?: string
) => {
    const diagramInstanceState = selectDiagramInstanceState(state, instanceId);
    return diagramInstanceState.warningSortCriteria;
};

export const selectHiddenWarningIdList = (
    state: RootState, //
    instanceId?: string
) => {
    const diagramInstanceState = selectDiagramInstanceState(state, instanceId);
    return diagramInstanceState.hiddenWarningIdList;
};

export const selectWarningList = (
    state: RootState, //
    instanceId?: string
) => {
    const diagramInstanceState = selectDiagramInstanceState(state, instanceId);
    return diagramInstanceState.warningList;
};

export const selectDiagramIsConnecting = (
    state: RootState, //
    instanceId?: string
) => {
    const diagramInstanceState = selectDiagramInstanceState(state, instanceId);
    return diagramInstanceState.isConnecting;
};

export const selectDiagramIsConnectingHandleType = (
    state: RootState, //
    instanceId?: string
) => {
    const diagramInstanceState = selectDiagramInstanceState(state, instanceId);
    return diagramInstanceState.isConnectingHandleType;
};

export const selectDiagramDraftNode = (state: RootState, instanceId?: string) => {
    const diagramInstanceState = selectDiagramInstanceState(state, instanceId);
    return diagramInstanceState.draftNode;
};

export const selectDiagramDraftEdge = (state: RootState, instanceId?: string) => {
    const diagramInstanceState = selectDiagramInstanceState(state, instanceId);
    return diagramInstanceState.draftEdge;
};

export const selectDiagramDraftNodeLabel = (state: RootState, instanceId?: string) => {
    const diagramInstanceState = selectDiagramInstanceState(state, instanceId);
    return diagramInstanceState.draftNodeLabel;
};

export const selectDiagramDraftEdgeLabel = (state: RootState, instanceId?: string) => {
    const diagramInstanceState = selectDiagramInstanceState(state, instanceId);
    return diagramInstanceState.draftEdgeLabel;
};

export const selectDiagramDraftNodeAttributes = (state: RootState, instanceId?: string) => {
    const diagramInstanceState = selectDiagramInstanceState(state, instanceId);
    return diagramInstanceState.draftNodeAttributes;
};

export const selectDiagramDraftEdgeAttributes = (state: RootState, instanceId?: string) => {
    const diagramInstanceState = selectDiagramInstanceState(state, instanceId);
    return diagramInstanceState.draftEdgeAttributes;
};

export const selectDiagramDraftNodeLoaded = (state: RootState, instanceId?: string) => {
    const diagramInstanceState = selectDiagramInstanceState(state, instanceId);
    return diagramInstanceState.draftNodeLoaded;
};

export const selectDiagramDraftEdgeLoaded = (state: RootState, instanceId?: string) => {
    const diagramInstanceState = selectDiagramInstanceState(state, instanceId);
    return diagramInstanceState.draftEdgeLoaded;
};

export const selectIsNodeDrawerDirty = (state: RootState, instanceId?: string) => {
    const diagramInstanceState = selectDiagramInstanceState(state, instanceId);
    return diagramInstanceState.isNodeDrawerDirty;
};

export const selectIsEdgeDrawerDirty = (state: RootState, instanceId?: string) => {
    const diagramInstanceState = selectDiagramInstanceState(state, instanceId);
    return diagramInstanceState.isEdgeDrawerDirty;
};

export const selectViewSelectDisabled = (
    state: RootState, //
    instanceId?: string
) => {
    const diagramInstanceState = selectDiagramInstanceState(state, instanceId);
    return diagramInstanceState.viewSelectDisabled;
};

export const selectBackendSaveEnabled = (
    state: RootState, //
    instanceId?: string
) => {
    const diagramInstanceState = selectDiagramInstanceState(state, instanceId);
    return diagramInstanceState.backendSaveEnabled ?? true;
};

export const selectCanvasViewOnlyLocked = (
    state: RootState, //
    instanceId?: string
) => {
    const diagramInstanceState = selectDiagramInstanceState(state, instanceId);
    return diagramInstanceState.canvasViewOnlyLocked ?? true;
};

export const selectInTransition = (
    state: RootState, //
    _instanceId?: string
) => {
    return state.diagram.inTransition;
};

export const selectPendingDrawerKey = (
    state: RootState, //
    instanceId?: string
) => {
    const diagramInstanceState = selectDiagramInstanceState(state, instanceId);
    return diagramInstanceState.pendingDrawerKey;
};

export const selectRequestedThreatScenarioDrawerKey = (
    state: RootState, //
    instanceId?: string
) => {
    const diagramInstanceState = selectDiagramInstanceState(state, instanceId);
    return diagramInstanceState.requestedThreatScenarioDrawerKey;
};

export const selectBiDirectionalArrow = (
    state: RootState, //
    instanceId?: string
) => {
    const diagramInstanceState = selectDiagramInstanceState(state, instanceId);
    return diagramInstanceState.biDirectionalArrow;
};

export const selectDiagramOverlayEdges = (
    state: RootState, //
    instanceId?: string
) => {
    const diagramInstanceState = selectDiagramInstanceState(state, instanceId);
    return diagramInstanceState.overlayEdges;
};

export const selectDiagramOverlayNodes = (
    state: RootState, //
    instanceId?: string
) => {
    const diagramInstanceState = selectDiagramInstanceState(state, instanceId);
    return diagramInstanceState.overlayNodes;
};

export const selectDiagramLineSegments = (
    state: RootState, //
    instanceId?: string
) => {
    const diagramInstanceState = selectDiagramInstanceState(state, instanceId);
    return diagramInstanceState.lineSegments ?? EMPTY_DIAGRAM_LINE_SEGMENTS;
};

export const selectDiagramEdgeSegmentedPaths = (
    state: RootState, //
    instanceId?: string
) => {
    const diagramInstanceState = selectDiagramInstanceState(state, instanceId);
    return diagramInstanceState.edgeSegmentedPaths ?? EMPTY_DIAGRAM_EDGE_SEGMENTED_PATHS;
};

export const selectNodeHandleEdgeMapping = (
    state: RootState, //
    instanceId?: string
) => {
    const diagramInstanceState = selectDiagramInstanceState(state, instanceId);
    return diagramInstanceState.nodeHandleEdgeMapping ?? EMPTY_NODE_HANDLE_EDGE_MAPPING;
};

export const selectDiagramCanvasInit = (
    state: RootState, //
    instanceId?: string
) => {
    const diagramInstanceState = selectDiagramInstanceState(state, instanceId);
    return diagramInstanceState.canvasInit;
};

export const selectSelectedPathId = (
    state: RootState, //
    instanceId?: string
) => {
    const diagramInstanceState = selectDiagramInstanceState(state, instanceId);
    return diagramInstanceState.selectedPathId;
};

export const selectPathSelectDisabled = (
    state: RootState, //
    instanceId?: string
) => {
    const diagramInstanceState = selectDiagramInstanceState(state, instanceId);
    return diagramInstanceState.pathSelectDisabled;
};

export const selectTargetNodeId = (
    state: RootState, //
    instanceId?: string
) => {
    const diagramInstanceState = selectDiagramInstanceState(state, instanceId);
    return diagramInstanceState.targetNodeId;
};

export const selectTargetEdgeId = (
    state: RootState, //
    instanceId?: string
) => {
    const diagramInstanceState = selectDiagramInstanceState(state, instanceId);
    return diagramInstanceState.targetEdgeId;
};

export const selectTargetNodePulseToken = (
    state: RootState, //
    instanceId?: string
) => {
    const diagramInstanceState = selectDiagramInstanceState(state, instanceId);
    return diagramInstanceState.targetNodePulseToken;
};

export const selectTargetEdgePulseToken = (
    state: RootState, //
    instanceId?: string
) => {
    const diagramInstanceState = selectDiagramInstanceState(state, instanceId);
    return diagramInstanceState.targetEdgePulseToken;
};

export const selectStepNumber = (
    state: RootState, //
    instanceId?: string
) => {
    const diagramInstanceState = selectDiagramInstanceState(state, instanceId);
    return diagramInstanceState.stepNumber;
};

export const selectViewNodeDetails = (
    state: RootState, //
    instanceId?: string
) => {
    const diagramInstanceState = selectDiagramInstanceState(state, instanceId);
    return diagramInstanceState.viewNodeDetails;
};

export const selectViewEdgeDetails = (
    state: RootState, //
    instanceId?: string
) => {
    const diagramInstanceState = selectDiagramInstanceState(state, instanceId);
    return diagramInstanceState.viewEdgeDetails;
};

export const selectDiagramSelectedTabGroup = (state: RootState, instanceId?: string) => {
    const diagramInstanceState = selectDiagramInstanceState(state, instanceId);
    return diagramInstanceState.selectedTabGroup;
};

export const selectDiagramSelectedDataflowCanvasId = (state: RootState, instanceId?: string) => {
    const diagramInstanceState = selectDiagramInstanceState(state, instanceId);
    return diagramInstanceState.selectedDataflowCanvasId;
};

export const selectDiagramEditToolbarState = (state: RootState, instanceId?: string) => {
    const diagramInstanceState = selectDiagramInstanceState(state, instanceId);
    return diagramInstanceState.editToolbarState ?? DEFAULT_DIAGRAM_EDIT_TOOLBAR_STATE;
};

export const selectDrawerState = (
    state: RootState, //
    instanceId?: string
) => {
    const diagramInstanceState = selectDiagramInstanceState(state, instanceId);
    return diagramInstanceState.drawerState;
};

export const selectResourceDrawerSelected = (
    state: RootState, //
    instanceId?: string
) => {
    const diagramInstanceState = selectDiagramInstanceState(state, instanceId);
    return diagramInstanceState.resourceDrawerSelected;
};

export const selectResourceDrawerSearchStrings = (state: RootState, instanceId?: string) => {
    const diagramInstanceState = selectDiagramInstanceState(state, instanceId);
    return diagramInstanceState.resourceDrawerSearchStrings;
};

export const selectResourceDrawerViewMode = (state: RootState, instanceId?: string) => {
    const diagramInstanceState = selectDiagramInstanceState(state, instanceId);
    return diagramInstanceState.resourceDrawerViewMode;
};

export const selectIsAttributeDrawerOpen = (
    state: RootState, //
    instanceId?: string
) => {
    const diagramInstanceState = selectDiagramInstanceState(state, instanceId);
    return diagramInstanceState.isAttributeDrawerOpen;
};

export const selectSelectedAttackStep = (
    state: RootState, //
    instanceId?: string
) => {
    const diagramInstanceState = selectDiagramInstanceState(state, instanceId);
    return diagramInstanceState.selectedAttackStep;
};

export const selectNodeAttackStepCountMapping = (
    state: RootState, //
    instanceId?: string
) => {
    const diagramInstanceState = selectDiagramInstanceState(state, instanceId);
    return diagramInstanceState.nodeAttackStepCountMapping;
};

export const selectNodeAttackPathMapping = (
    state: RootState, //
    instanceId?: string
) => {
    const diagramInstanceState = selectDiagramInstanceState(state, instanceId);
    return diagramInstanceState.nodeAttackPathMapping;
};

export const selectViewAllPaths = (
    state: RootState, //
    instanceId?: string
) => {
    const diagramInstanceState = selectDiagramInstanceState(state, instanceId);
    return diagramInstanceState.viewAllPaths;
};

export const selectPendingThreatOverviewScenarioScope = (
    state: RootState, //
    instanceId?: string
) => {
    const diagramInstanceState = selectDiagramInstanceState(state, instanceId);
    return diagramInstanceState.pendingThreatOverviewScenarioScope;
};

export const selectThreatOverviewScenarioScope = (
    state: RootState, //
    instanceId?: string
) => {
    const diagramInstanceState = selectDiagramInstanceState(state, instanceId);
    return diagramInstanceState.threatOverviewScenarioScope;
};

export const selectVisibleThreatScenarioCanvasIds = (
    state: RootState, //
    instanceId?: string
) => {
    const diagramInstanceState = selectDiagramInstanceState(state, instanceId);
    return diagramInstanceState.visibleThreatScenarioCanvasIds;
};

export const selectHideAllPaths = (
    state: RootState, //
    instanceId?: string
) => {
    const diagramInstanceState = selectDiagramInstanceState(state, instanceId);
    return diagramInstanceState.hideAllPaths;
};

export const selectStartAttackPath = (
    state: RootState, //
    instanceId?: string
) => {
    const diagramInstanceState = selectDiagramInstanceState(state, instanceId);
    return diagramInstanceState.startAttackPath;
};

export const selectThreatScenarioExpandedFrameworkKeys = (
    state: RootState,
    instanceId?: string
) => {
    const diagramInstanceState = selectDiagramInstanceState(state, instanceId);
    return diagramInstanceState.threatScenarioExpandedFrameworkKeys;
};

export const selectAttackPathSelectionFieldContentHeights = (
    state: RootState,
    instanceId?: string
) => {
    const diagramInstanceState = selectDiagramInstanceState(state, instanceId);
    return diagramInstanceState.attackPathSelectionFieldContentHeights;
};

export const selectJoyrideViewType = (
    state: RootState, //
    instanceId?: string
) => {
    const diagramInstanceState = selectDiagramInstanceState(state, instanceId);
    return diagramInstanceState.joyrideViewType;
};

// ====================
// Draft Canvas Resolver
// ====================

export const selectDiagramDraftCanvas = (
    state: RootState,
    instanceId?: string
): DiagramCanvas | undefined => {
    const diagramInstanceState = selectDiagramInstanceState(state, instanceId);

    return (
        diagramInstanceState.draftCanvas ??
        getSelectedCanvas({
            diagramInstances: state.diagram.instances,
            instanceId,
            projectDiagram: selectBackendProjectDiagram(state),
        })
    );
};

// ====================
// Draft Canvas Accessors
// ====================

export const selectDiagramDraftCanvasType = (
    state: RootState,
    instanceId?: string
): DiagramCanvas["canvas_type"] | undefined => {
    const draftCanvas = selectDiagramDraftCanvas(state, instanceId);
    return draftCanvas?.canvas_type;
};

export const selectDiagramDraftCanvasViewOnly = (
    state: RootState,
    instanceId?: string
): boolean | undefined => {
    const draftCanvas = selectDiagramDraftCanvas(state, instanceId);
    return draftCanvas?.view_only;
};

export const selectDiagramDraftCanvasRef = (
    state: RootState,
    instanceId?: string
): DiagramCanvas["ref"] | undefined => {
    const draftCanvas = selectDiagramDraftCanvas(state, instanceId);
    return draftCanvas?.ref;
};

export const selectDiagramDraftCanvasName = (
    state: RootState,
    instanceId?: string
): DiagramCanvas["canvas_name"] | undefined => {
    const draftCanvas = selectDiagramDraftCanvas(state, instanceId);
    return draftCanvas?.canvas_name;
};

export const selectDiagramDraftCanvasLlmGenerationStatus = (
    state: RootState,
    instanceId?: string
): number => {
    const draftCanvas = selectDiagramDraftCanvas(state, instanceId);
    return draftCanvas?.llm_generation_status ?? 0;
};

export const selectDiagramCapabilities = (
    state: RootState,
    instanceId?: string
): DiagramCapabilitiesState => {
    const instance = selectDiagramInstanceState(state, instanceId);
    return instance.capabilities;
};
