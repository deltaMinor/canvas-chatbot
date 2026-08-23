import React from "react";
import { useSelector } from "react-redux";

import { useDiagramInstanceId } from "#root/contexts/DiagramInstanceContext";
import { useProjectDiagram } from "#root/hooks/backendHooks";
import { OptionLabel } from "#root/interfaces";
import {
    CanvasColumn,
    DeviceToInterfaceMappingSingle,
    DiagramCanvas,
    DiagramEdge,
    DiagramNode,
    LineSegment,
    NodeHandleEdgeMappingDict,
} from "#root/interfaces/diagram";
import { DiagramElementAttributes } from "#root/interfaces/diagramAttributes";
import { NodeHandleEdgeMappingResolver } from "#root/lib/NodeHandleEdgeMappingResolver";
import { DiagramEditToolbarState } from "#root/redux/projectDiagramFeatureSlice";
import { RootState } from "#root/redux/store";
import {
    selectAttackPathSelectionFieldContentHeights,
    selectBackendSaveEnabled,
    selectBiDirectionalArrow,
    selectDiagramCanvasHistory,
    selectDiagramCanvasHistoryIndex,
    selectDiagramCanvasInit,
    selectDiagramCapabilities,
    selectDiagramDraftCanvasLlmGenerationStatus,
    selectDiagramDraftCanvasName,
    selectDiagramDraftCanvasRef,
    selectDiagramDraftCanvasType,
    selectDiagramDraftCanvasViewOnly,
    selectDiagramDraftEdge,
    selectDiagramDraftEdgeAttributes,
    selectDiagramDraftEdgeLabel,
    selectDiagramDraftEdgeLoaded,
    selectDiagramDraftNode,
    selectDiagramDraftNodeAttributes,
    selectDiagramDraftNodeLabel,
    selectDiagramDraftNodeLoaded,
    selectDiagramEdgeSegmentedPaths,
    selectDiagramEditToolbarState,
    selectDiagramInstanceState,
    selectDiagramIsConnecting,
    selectDiagramIsConnectingHandleType,
    selectDiagramLineSegments,
    selectDiagramMiniMapExpanded,
    selectDiagramOverlayEdges,
    selectDiagramOverlayNodes,
    selectDiagramSelectedDataflowCanvasId,
    selectDiagramSelectedTabGroup,
    selectDiagramSetupNaturalLanguageDescription,
    selectDiagramSetupPendingSelectedOption,
    selectDiagramSetupSelectedOption,
    selectDiagramSetupSelectedTemplateCanvasId,
    selectDiagramToscaReportMapping,
    selectDiagramUserStoryCanvasColumnButtonSelectedPositionMapping,
    selectDiagramUserStoryNodesPositionApplyToAll,
    selectDiagramUserStoryPendingSelectedDataNodesMapping,
    selectDiagramView,
    selectDraftCanvasId,
    selectDrawerState,
    selectHiddenEdgeIds,
    selectHiddenWarningIdList,
    selectHideAllPaths,
    selectInTransition,
    selectIsAttributeDrawerOpen,
    selectIsEdgeDrawerDirty,
    selectIsNodeDrawerDirty,
    selectJoyrideViewType,
    selectNodeAttackPathMapping,
    selectNodeAttackStepCountMapping,
    selectNodeHandleEdgeMapping,
    selectPathSelectDisabled,
    selectPendingDrawerKey,
    selectPendingThreatOverviewScenarioScope,
    selectRequestedThreatScenarioDrawerKey,
    selectResourceDrawerSearchStrings,
    selectResourceDrawerSelected,
    selectResourceDrawerViewMode,
    selectSelectedAttackStep,
    selectSelectedEdgeIdList,
    selectSelectedNodeIdList,
    selectSelectedPathId,
    selectStartAttackPath,
    selectStepNumber,
    selectTargetEdgeId,
    selectTargetEdgePulseToken,
    selectTargetNodeId,
    selectTargetNodePulseToken,
    selectThreatOverviewScenarioScope,
    selectThreatScenarioExpandedFrameworkKeys,
    selectViewAllPaths,
    selectViewEdgeDetails,
    selectViewNodeDetails,
    selectViewSelectDisabled,
    selectVisibleThreatScenarioCanvasIds,
    selectWarningFilterKey,
    selectWarningList,
    selectWarningListMapping,
    selectWarningSortCriteria,
    selectWarningSortDirection,
} from "#root/selectors/projectDiagramFeatureSelectors";
import {
    setDiagramMiniMapExpanded,
    setDiagramSelectedDataflowCanvasId,
    setDiagramSelectedTabGroup,
} from "#root/stores/projectDiagram/canvas";
import {
    setDiagramCanvasHistory,
    setDiagramCanvasHistoryIndex,
} from "#root/stores/projectDiagram/canvasHistory";
import {
    setDiagramIsConnecting,
    setDiagramIsConnectingHandleType,
} from "#root/stores/projectDiagram/connection";
import {
    setDiagramEdgeSegmentedPath,
    setDiagramEdgeSegmentedPaths,
    setDiagramLineSegments,
} from "#root/stores/projectDiagram/draggableEdge";
import {
    setDiagramDraftEdge,
    setDiagramDraftEdgeAttributes,
    setDiagramDraftEdgeLabel,
    setDiagramDraftEdgeLoaded,
    setDiagramDraftNode,
    setDiagramDraftNodeAttributes,
    setDiagramDraftNodeLabel,
    setDiagramDraftNodeLoaded,
    setDiagramDrawerState,
    setDiagramIsAttributeDrawerOpen,
    setDiagramIsEdgeDrawerDirty,
    setDiagramIsNodeDrawerDirty,
    setDiagramResourceDrawerSearchStrings,
    setDiagramResourceDrawerSelected,
    setDiagramResourceDrawerViewMode,
} from "#root/stores/projectDiagram/drawer";
import { setDiagramEditToolbarState } from "#root/stores/projectDiagram/editToolbar";
import { setDiagramJoyrideViewType, setDiagramView } from "#root/stores/projectDiagram/joyride";
import {
    setDiagramSelectedEdgeIdList,
    setDiagramSelectedNodeIdList,
} from "#root/stores/projectDiagram/selection";
import {
    setDiagramSetupNaturalLanguageDescription,
    setDiagramSetupPendingSelectedOption,
    setDiagramSetupSelectedOption,
    setDiagramSetupSelectedTemplateCanvasId,
} from "#root/stores/projectDiagram/setup";
import { setDiagramToscaReportMapping } from "#root/stores/projectDiagram/toscaValidation";
import {
    setDiagramUserStoryCanvasColumnButtonSelectedPositionMapping,
    setDiagramUserStoryNodesPositionApplyToAll,
    setDiagramUserStoryPendingSelectedDataNodesMapping,
} from "#root/stores/projectDiagram/userStory";
import { setDiagramHiddenEdgeIds } from "#root/stores/projectDiagram/visibility";
import {
    setDiagramHiddenWarningIdList,
    setDiagramWarningFilterKey,
    setDiagramWarningList,
    setDiagramWarningListMapping,
    setDiagramWarningSortCriteria,
    setDiagramWarningSortDirection,
} from "#root/stores/projectDiagram/warnings";
import {
    getAllEdges,
    getAllNodes,
    getArchitectureCanvas,
    getArchitectureEdges,
    getArchitectureNodes,
    getCanvasById,
    getSelectedCanvas,
} from "#root/utils/diagram/backendDiagramUtil";
import { hydrateDiagramElementAttributes } from "#root/utils/diagram/diagramAttributeUtil";
import { getDeviceToInterfaceMappingFromCanvas } from "#root/utils/diagram/diagramDataflowUtil";
import {
    getActiveEdges,
    getActiveNodes,
    getActiveThreatScenarioSelection,
    getDiagramDraftCanvasEdges,
    getDiagramDraftCanvasNodes,
    getDiagramEdgeSegmentedPath,
} from "#root/utils/diagram/diagramSelectionUtil";
import {
    getNextWarningFlterKey,
    getNextWarningSortDirection,
} from "#root/utils/diagram/diagramWarningUtil";
import { resolveNextStateAction } from "#root/utils/diagramUtil";

// ==============================
// useSelector Hooks
// ==============================

export const useDiagramInstanceState = () => {
    const instanceId = useDiagramInstanceId();

    return useSelector(
        (state: RootState) => selectDiagramInstanceState(state, instanceId) //
    );
};

export const useDiagramDraftCanvasId = () => {
    const instanceId = useDiagramInstanceId();

    return useSelector(
        (state: RootState) => selectDraftCanvasId(state, instanceId) //
    );
};

export const useDiagramCanvasHistory = () => {
    const instanceId = useDiagramInstanceId();

    return useSelector(
        (state: RootState) => selectDiagramCanvasHistory(state, instanceId) //
    );
};

export const useDiagramCanvasHistoryIndex = () => {
    const instanceId = useDiagramInstanceId();

    return useSelector(
        (state: RootState) => selectDiagramCanvasHistoryIndex(state, instanceId) //
    );
};

export const useDiagramSelectedNodeIdList = () => {
    const instanceId = useDiagramInstanceId();

    return useSelector(
        (state: RootState) => selectSelectedNodeIdList(state, instanceId) //
    );
};

export const useDiagramSelectedEdgeIdList = () => {
    const instanceId = useDiagramInstanceId();

    return useSelector(
        (state: RootState) => selectSelectedEdgeIdList(state, instanceId) //
    );
};

export const useDiagramMiniMapExpanded = () => {
    const instanceId = useDiagramInstanceId();

    return useSelector(
        (state: RootState) => selectDiagramMiniMapExpanded(state, instanceId) //
    );
};

export const useDiagramSetupSelectedOption = () => {
    const instanceId = useDiagramInstanceId();

    return useSelector(
        (state: RootState) => selectDiagramSetupSelectedOption(state, instanceId) //
    );
};

export const useDiagramSetupPendingSelectedOption = () => {
    const instanceId = useDiagramInstanceId();

    return useSelector(
        (state: RootState) => selectDiagramSetupPendingSelectedOption(state, instanceId) //
    );
};

export const useDiagramSetupSelectedTemplateCanvasId = () => {
    const instanceId = useDiagramInstanceId();

    return useSelector(
        (state: RootState) => selectDiagramSetupSelectedTemplateCanvasId(state, instanceId) //
    );
};

export const useDiagramSetupNaturalLanguageDescription = () => {
    const instanceId = useDiagramInstanceId();

    return useSelector(
        (state: RootState) => selectDiagramSetupNaturalLanguageDescription(state, instanceId) //
    );
};

export const useDiagramUserStoryPendingSelectedDataNodesMapping = () => {
    const instanceId = useDiagramInstanceId();

    return useSelector(
        (state: RootState) =>
            selectDiagramUserStoryPendingSelectedDataNodesMapping(state, instanceId) //
    );
};

export const useDiagramUserStoryPendingSelectedDataNodes = (
    dataNodeId: string | undefined,
    fallbackValue: OptionLabel[]
) => {
    const pendingSelectedDataNodesMapping = useDiagramUserStoryPendingSelectedDataNodesMapping();

    return React.useMemo(() => {
        if (!dataNodeId) return fallbackValue;
        return pendingSelectedDataNodesMapping[dataNodeId] ?? fallbackValue;
    }, [dataNodeId, fallbackValue, pendingSelectedDataNodesMapping]);
};

export const useDiagramUserStoryNodesPositionApplyToAll = () => {
    const instanceId = useDiagramInstanceId();

    return useSelector(
        (state: RootState) => selectDiagramUserStoryNodesPositionApplyToAll(state, instanceId) //
    );
};

export const useDiagramUserStoryCanvasColumnButtonSelectedPositionMapping = () => {
    const instanceId = useDiagramInstanceId();

    return useSelector(
        (state: RootState) =>
            selectDiagramUserStoryCanvasColumnButtonSelectedPositionMapping(state, instanceId) //
    );
};

const USER_STORY_CANVAS_COLUMN_ALL_KEY = "__all__";

export const useDiagramUserStoryCanvasColumnButtonSelectedPosition = (
    nodeId: string | undefined,
    fallbackValue: CanvasColumn | undefined
) => {
    const selectedPositionMapping = useDiagramUserStoryCanvasColumnButtonSelectedPositionMapping();
    const key = nodeId ?? USER_STORY_CANVAS_COLUMN_ALL_KEY;

    return React.useMemo(
        () => selectedPositionMapping[key] ?? fallbackValue,
        [fallbackValue, key, selectedPositionMapping]
    );
};

export const useDiagramHiddenEdgeIds = () => {
    const instanceId = useDiagramInstanceId();

    return useSelector(
        (state: RootState) => selectHiddenEdgeIds(state, instanceId) //
    );
};

export const useDiagramWarningListMapping = () => {
    const instanceId = useDiagramInstanceId();

    return useSelector(
        (state: RootState) => selectWarningListMapping(state, instanceId) //
    );
};

/**
 * Reads the combined diagram capabilities from Redux.
 * Returns the value last written by useDiagramCapabilities (via
 * useDiagramCapabilitiesSyncEffect in the body-effects component).
 * Use useDiagramCapabilities() directly in components that need the
 * computed value without Redux round-trip latency.
 */
export const useDiagramCapabilitiesState = () => {
    const instanceId = useDiagramInstanceId();

    return useSelector(
        (state: RootState) => selectDiagramCapabilities(state, instanceId) //
    );
};

export const useDiagramToscaReportMapping = () => {
    const instanceId = useDiagramInstanceId();

    return useSelector(
        (state: RootState) => selectDiagramToscaReportMapping(state, instanceId) //
    );
};

export const useDiagramWarningFilterKey = () => {
    const instanceId = useDiagramInstanceId();

    return useSelector(
        (state: RootState) => selectWarningFilterKey(state, instanceId) //
    );
};

export const useDiagramWarningSortDirection = () => {
    const instanceId = useDiagramInstanceId();

    return useSelector(
        (state: RootState) => selectWarningSortDirection(state, instanceId) //
    );
};

export const useDiagramWarningSortCriteria = () => {
    const instanceId = useDiagramInstanceId();

    return useSelector(
        (state: RootState) => selectWarningSortCriteria(state, instanceId) //
    );
};

export const useDiagramHiddenWarningIdList = () => {
    const instanceId = useDiagramInstanceId();

    return useSelector(
        (state: RootState) => selectHiddenWarningIdList(state, instanceId) //
    );
};

export const useDiagramWarningList = () => {
    const instanceId = useDiagramInstanceId();

    return useSelector(
        (state: RootState) => selectWarningList(state, instanceId) //
    );
};

export const useDiagramIsConnecting = () => {
    const instanceId = useDiagramInstanceId();

    return useSelector(
        (state: RootState) => selectDiagramIsConnecting(state, instanceId) //
    );
};

export const useDiagramIsConnectingHandleType = () => {
    const instanceId = useDiagramInstanceId();

    return useSelector(
        (state: RootState) => selectDiagramIsConnectingHandleType(state, instanceId) //
    );
};

export const useDiagramDraftCanvas = () => {
    const instanceId = useDiagramInstanceId();
    const projectDiagram = useProjectDiagram();
    const diagramInstanceState = useDiagramInstanceState();

    return React.useMemo(
        () =>
            diagramInstanceState.draftCanvas ??
            getSelectedCanvas({
                diagramInstances: { [instanceId ?? ""]: diagramInstanceState },
                instanceId,
                projectDiagram,
            }),
        [diagramInstanceState, instanceId, projectDiagram]
    );
};

export const useDiagramDraftCanvasType = () => {
    const instanceId = useDiagramInstanceId();

    return useSelector(
        (state: RootState) => selectDiagramDraftCanvasType(state, instanceId) //
    );
};

export const useDiagramDraftCanvasViewOnly = () => {
    const instanceId = useDiagramInstanceId();
    const selectedCanvasViewOnly = useSelector(
        (state: RootState) => selectDiagramDraftCanvasViewOnly(state, instanceId) //
    );

    return !!selectedCanvasViewOnly;
};

export const useDiagramDraftCanvasRef = () => {
    const instanceId = useDiagramInstanceId();

    return useSelector(
        (state: RootState) => selectDiagramDraftCanvasRef(state, instanceId) //
    );
};

export const useDiagramDraftCanvasName = () => {
    const instanceId = useDiagramInstanceId();

    return useSelector(
        (state: RootState) => selectDiagramDraftCanvasName(state, instanceId) //
    );
};

export const useDiagramDraftCanvasNodes = () => {
    const draftCanvas = useDiagramDraftCanvas();

    return React.useMemo(() => getDiagramDraftCanvasNodes(draftCanvas), [draftCanvas]);
};

export const useDiagramDraftCanvasEdges = () => {
    const draftCanvas = useDiagramDraftCanvas();

    return React.useMemo(() => getDiagramDraftCanvasEdges(draftCanvas), [draftCanvas]);
};

export const useDiagramDraftCanvasLLMGenerationStatus = () => {
    const instanceId = useDiagramInstanceId();

    return useSelector(
        (state: RootState) => selectDiagramDraftCanvasLlmGenerationStatus(state, instanceId) //
    );
};

export const useDiagramDraftNode = () => {
    const instanceId = useDiagramInstanceId();

    return useSelector(
        (state: RootState) => selectDiagramDraftNode(state, instanceId) //
    );
};

export const useDiagramDraftEdge = () => {
    const instanceId = useDiagramInstanceId();

    return useSelector(
        (state: RootState) => selectDiagramDraftEdge(state, instanceId) //
    );
};

export const useDiagramDraftNodeLabel = () => {
    const instanceId = useDiagramInstanceId();

    return useSelector(
        (state: RootState) => selectDiagramDraftNodeLabel(state, instanceId) //
    );
};

export const useDiagramDraftEdgeLabel = () => {
    const instanceId = useDiagramInstanceId();

    return useSelector(
        (state: RootState) => selectDiagramDraftEdgeLabel(state, instanceId) //
    );
};

export const useDiagramDraftNodeAttributes = () => {
    const instanceId = useDiagramInstanceId();
    const draftNode = useDiagramDraftNode();
    const rawAttributes = useSelector(
        (state: RootState) => selectDiagramDraftNodeAttributes(state, instanceId) //
    );

    return React.useMemo(
        () =>
            hydrateDiagramElementAttributes(rawAttributes, {
                main: draftNode ?? {},
                main_advanced: draftNode ?? {},
                data: draftNode?.data ?? {},
                data_advanced: draftNode?.data ?? {},
                style: (draftNode?.style as Record<string, unknown>) ?? {},
                style_advanced: (draftNode?.style as Record<string, unknown>) ?? {},
                cacti: draftNode?.data ?? {},
            }),
        [draftNode, rawAttributes]
    );
};

export const useDiagramDraftEdgeAttributes = () => {
    const instanceId = useDiagramInstanceId();
    const draftEdge = useDiagramDraftEdge();
    const rawAttributes = useSelector(
        (state: RootState) => selectDiagramDraftEdgeAttributes(state, instanceId) //
    );

    return React.useMemo(
        () =>
            hydrateDiagramElementAttributes(rawAttributes, {
                main: draftEdge ?? {},
                main_advanced: draftEdge ?? {},
                data: draftEdge?.data ?? {},
                data_advanced: draftEdge?.data ?? {},
                style: (draftEdge?.style as Record<string, unknown>) ?? {},
                style_advanced: (draftEdge?.style as Record<string, unknown>) ?? {},
                cacti: draftEdge?.data ?? {},
                markerStart: (draftEdge?.markerStart as Record<string, unknown>) ?? {},
                markerEnd: (draftEdge?.markerEnd as Record<string, unknown>) ?? {},
            }),
        [draftEdge, rawAttributes]
    );
};

export const useDiagramDraftNodeLoaded = () => {
    const instanceId = useDiagramInstanceId();

    return useSelector(
        (state: RootState) => selectDiagramDraftNodeLoaded(state, instanceId) //
    );
};

export const useDiagramDraftEdgeLoaded = () => {
    const instanceId = useDiagramInstanceId();

    return useSelector(
        (state: RootState) => selectDiagramDraftEdgeLoaded(state, instanceId) //
    );
};

export const useDiagramNodeDrawerDirty = () => {
    const instanceId = useDiagramInstanceId();

    return useSelector(
        (state: RootState) => selectIsNodeDrawerDirty(state, instanceId) //
    );
};

export const useDiagramEdgeDrawerDirty = () => {
    const instanceId = useDiagramInstanceId();

    return useSelector(
        (state: RootState) => selectIsEdgeDrawerDirty(state, instanceId) //
    );
};

export const useDiagramViewSelectDisabled = () => {
    const instanceId = useDiagramInstanceId();

    return useSelector(
        (state: RootState) => selectViewSelectDisabled(state, instanceId) //
    );
};

export const useDiagramBackendSaveEnabled = () => {
    const instanceId = useDiagramInstanceId();

    return useSelector(
        (state: RootState) => selectBackendSaveEnabled(state, instanceId) //
    );
};

export const useDiagramInTransition = () => {
    return useSelector(
        (state: RootState) => selectInTransition(state) //
    );
};

export const useDiagramPendingDrawerKey = () => {
    const instanceId = useDiagramInstanceId();

    return useSelector(
        (state: RootState) => selectPendingDrawerKey(state, instanceId) //
    );
};

export const useDiagramRequestedThreatScenarioDrawerKey = () => {
    const instanceId = useDiagramInstanceId();

    return useSelector(
        (state: RootState) => selectRequestedThreatScenarioDrawerKey(state, instanceId) //
    );
};

export const useDiagramBiDirectionalArrow = () => {
    const instanceId = useDiagramInstanceId();

    return useSelector(
        (state: RootState) => selectBiDirectionalArrow(state, instanceId) //
    );
};

export const useDiagramEdges = () => {
    return useDiagramDraftCanvasEdges();
};

export const useDiagramNodes = () => {
    return useDiagramDraftCanvasNodes();
};

export const useDiagramOverlayEdges = () => {
    const instanceId = useDiagramInstanceId();

    return useSelector(
        (state: RootState) => selectDiagramOverlayEdges(state, instanceId) //
    );
};

export const useDiagramOverlayNodes = () => {
    const instanceId = useDiagramInstanceId();

    return useSelector(
        (state: RootState) => selectDiagramOverlayNodes(state, instanceId) //
    );
};

export const useDiagramLineSegments = () => {
    const instanceId = useDiagramInstanceId();

    return useSelector(
        (state: RootState) => selectDiagramLineSegments(state, instanceId) //
    );
};

export const useDiagramEdgeSegmentedPaths = () => {
    const instanceId = useDiagramInstanceId();

    return useSelector(
        (state: RootState) => selectDiagramEdgeSegmentedPaths(state, instanceId) //
    );
};

export const useDiagramEdgeSegmentedPath = (edgeId: string) => {
    const edgeSegmentedPaths = useDiagramEdgeSegmentedPaths();

    return React.useMemo(
        () => getDiagramEdgeSegmentedPath(edgeSegmentedPaths, edgeId),
        [edgeId, edgeSegmentedPaths]
    );
};

export const useActiveEdges = () => {
    const edges = useDiagramDraftCanvasEdges();
    const overlayEdges = useDiagramOverlayEdges();

    return React.useMemo(() => getActiveEdges(edges, overlayEdges), [edges, overlayEdges]);
};

export const useActiveNodes = () => {
    const nodes = useDiagramDraftCanvasNodes();
    const overlayNodes = useDiagramOverlayNodes();

    return React.useMemo(() => getActiveNodes(nodes, overlayNodes), [nodes, overlayNodes]);
};

export const useNodeHandleEdgeMapping = () => {
    const instanceId = useDiagramInstanceId();

    return useSelector(
        (state: RootState) => selectNodeHandleEdgeMapping(state, instanceId) //
    );
};

export const useDiagramCanvasInit = () => {
    const instanceId = useDiagramInstanceId();

    return useSelector(
        (state: RootState) => selectDiagramCanvasInit(state, instanceId) //
    );
};

export const useDiagramAttackPaths = () => {
    const projectDiagram = useProjectDiagram();
    const draftCanvasId = useDiagramDraftCanvasId();
    const selectedPathId = useDiagramSelectedPathId();

    return React.useMemo(
        () =>
            getActiveThreatScenarioSelection({
                projectDiagram,
                draftCanvasId,
                selectedPathId,
            }).attackPaths,
        [draftCanvasId, projectDiagram, selectedPathId]
    );
};

export const useDiagramSelectedPathId = () => {
    const instanceId = useDiagramInstanceId();

    return useSelector(
        (state: RootState) => selectSelectedPathId(state, instanceId) //
    );
};

export const useDiagramSelectedPath = () => {
    const projectDiagram = useProjectDiagram();
    const draftCanvasId = useDiagramDraftCanvasId();
    const selectedPathId = useDiagramSelectedPathId();

    return React.useMemo(
        () =>
            getActiveThreatScenarioSelection({
                projectDiagram,
                draftCanvasId,
                selectedPathId,
            }).selectedPath,
        [draftCanvasId, projectDiagram, selectedPathId]
    );
};

export const useDiagramPathSelectDisabled = () => {
    const instanceId = useDiagramInstanceId();

    return useSelector(
        (state: RootState) => selectPathSelectDisabled(state, instanceId) //
    );
};

export const useTargetNodeId = () => {
    const instanceId = useDiagramInstanceId();

    return useSelector(
        (state: RootState) => selectTargetNodeId(state, instanceId) //
    );
};

export const useTargetEdgeId = () => {
    const instanceId = useDiagramInstanceId();

    return useSelector(
        (state: RootState) => selectTargetEdgeId(state, instanceId) //
    );
};

export const useTargetNodePulseToken = () => {
    const instanceId = useDiagramInstanceId();

    return useSelector(
        (state: RootState) => selectTargetNodePulseToken(state, instanceId) //
    );
};

export const useTargetEdgePulseToken = () => {
    const instanceId = useDiagramInstanceId();

    return useSelector(
        (state: RootState) => selectTargetEdgePulseToken(state, instanceId) //
    );
};

export const useDiagramStepNumber = () => {
    const instanceId = useDiagramInstanceId();

    return useSelector(
        (state: RootState) => selectStepNumber(state, instanceId) //
    );
};

export const useDiagramViewNodeDetails = () => {
    const instanceId = useDiagramInstanceId();

    return useSelector(
        (state: RootState) => selectViewNodeDetails(state, instanceId) //
    );
};

export const useDiagramViewEdgeDetails = () => {
    const instanceId = useDiagramInstanceId();

    return useSelector(
        (state: RootState) => selectViewEdgeDetails(state, instanceId) //
    );
};

export const useDiagramSelectedTabGroup = () => {
    const instanceId = useDiagramInstanceId();

    return useSelector(
        (state: RootState) => selectDiagramSelectedTabGroup(state, instanceId) //
    );
};

export const useDiagramSelectedDataflowCanvasId = () => {
    const instanceId = useDiagramInstanceId();

    return useSelector(
        (state: RootState) => selectDiagramSelectedDataflowCanvasId(state, instanceId) //
    );
};

export const useDiagramEditToolbarState = () => {
    const instanceId = useDiagramInstanceId();

    return useSelector(
        (state: RootState) => selectDiagramEditToolbarState(state, instanceId) //
    );
};

export const useDiagramDrawerState = () => {
    const instanceId = useDiagramInstanceId();

    return useSelector(
        (state: RootState) => selectDrawerState(state, instanceId) //
    );
};

export const useDiagramResourceDrawerSelected = () => {
    const instanceId = useDiagramInstanceId();

    return useSelector(
        (state: RootState) => selectResourceDrawerSelected(state, instanceId) //
    );
};

export const useDiagramResourceDrawerSearchStrings = () => {
    const instanceId = useDiagramInstanceId();

    return useSelector(
        (state: RootState) => selectResourceDrawerSearchStrings(state, instanceId) //
    );
};

export const useDiagramResourceDrawerViewMode = () => {
    const instanceId = useDiagramInstanceId();

    return useSelector(
        (state: RootState) => selectResourceDrawerViewMode(state, instanceId) //
    );
};

export const useDiagramIsAttributeDrawerOpen = () => {
    const instanceId = useDiagramInstanceId();

    return useSelector(
        (state: RootState) => selectIsAttributeDrawerOpen(state, instanceId) //
    );
};

export const useSelectedAttackStep = () => {
    const instanceId = useDiagramInstanceId();

    return useSelector(
        (state: RootState) => selectSelectedAttackStep(state, instanceId) //
    );
};

export const useNodeAttackStepCountMapping = () => {
    const instanceId = useDiagramInstanceId();

    return useSelector(
        (state: RootState) => selectNodeAttackStepCountMapping(state, instanceId) //
    );
};

export const useNodeAttackPathMapping = () => {
    const instanceId = useDiagramInstanceId();

    return useSelector(
        (state: RootState) => selectNodeAttackPathMapping(state, instanceId) //
    );
};

export const useViewAllPaths = () => {
    const instanceId = useDiagramInstanceId();

    return useSelector(
        (state: RootState) => selectViewAllPaths(state, instanceId) //
    );
};

export const usePendingThreatOverviewScenarioScope = () => {
    const instanceId = useDiagramInstanceId();

    return useSelector(
        (state: RootState) => selectPendingThreatOverviewScenarioScope(state, instanceId) //
    );
};

export const useThreatOverviewScenarioScope = () => {
    const instanceId = useDiagramInstanceId();

    return useSelector(
        (state: RootState) => selectThreatOverviewScenarioScope(state, instanceId) //
    );
};

export const useHideAllPaths = () => {
    const instanceId = useDiagramInstanceId();

    return useSelector(
        (state: RootState) => selectHideAllPaths(state, instanceId) //
    );
};

export const useVisibleThreatScenarioCanvasIds = () => {
    const instanceId = useDiagramInstanceId();

    return useSelector(
        (state: RootState) => selectVisibleThreatScenarioCanvasIds(state, instanceId) //
    );
};

export const useStartAttackPath = () => {
    const instanceId = useDiagramInstanceId();

    return useSelector(
        (state: RootState) => selectStartAttackPath(state, instanceId) //
    );
};

export const useDiagramThreatScenarioExpandedFrameworkKeys = () => {
    const instanceId = useDiagramInstanceId();

    return useSelector(
        (state: RootState) => selectThreatScenarioExpandedFrameworkKeys(state, instanceId) //
    );
};

export const useDiagramAttackPathSelectionFieldContentHeights = () => {
    const instanceId = useDiagramInstanceId();

    return useSelector(
        (state: RootState) => selectAttackPathSelectionFieldContentHeights(state, instanceId) //
    );
};

export const useIsThreatScenarioCanvas = () => {
    const diagramView = useDiagramView();

    return React.useMemo(() => diagramView === "visualizer", [diagramView]);
};

export const useShouldRenderAttackPathStepOverlays = (nodeId?: string) => {
    const isThreatScenarioCanvas = useIsThreatScenarioCanvas();
    const nodeAttackStepCountMapping = useNodeAttackStepCountMapping();
    const selectedPath = useDiagramSelectedPath();
    const viewAllPaths = useViewAllPaths();

    return React.useMemo(
        () =>
            isThreatScenarioCanvas &&
            (!!selectedPath || !!viewAllPaths) &&
            !!viewAllPaths &&
            (!!nodeId ? Object.keys(nodeAttackStepCountMapping).includes(nodeId) : true),
        [isThreatScenarioCanvas, nodeAttackStepCountMapping, nodeId, selectedPath, viewAllPaths]
    );
};

export const useNodeAttackStepCount = (nodeId: string) => {
    const nodeAttackStepCountMapping = useNodeAttackStepCountMapping();

    return React.useMemo(
        () => nodeAttackStepCountMapping?.[nodeId] ?? 0,
        [nodeAttackStepCountMapping, nodeId]
    );
};

export const useDiagramView = () => {
    return useSelector(selectDiagramView);
};

export const useJoyrideView = () => {
    const diagramView = useDiagramView();

    return React.useMemo(() => diagramView === "joyride", [diagramView]);
};

export const useEditorView = () => {
    const diagramView = useDiagramView();

    return React.useMemo(() => diagramView === "editor", [diagramView]);
};

export const useVisualizerView = () => {
    const diagramView = useDiagramView();

    return React.useMemo(() => diagramView === "visualizer", [diagramView]);
};

export const useJoyrideViewType = () => {
    const instanceId = useDiagramInstanceId();

    return useSelector(
        (state: RootState) => selectJoyrideViewType(state, instanceId) //
    );
};

export const useDialogSelectedNode = ({
    comparableNodeId,
    nodeId,
}: {
    comparableNodeId: string;
    nodeId: string;
}) => {
    const targetNodeId = useTargetNodeId();

    return React.useMemo(
        () => targetNodeId === nodeId || targetNodeId === comparableNodeId,
        [comparableNodeId, nodeId, targetNodeId]
    );
};

export const useSelectedAttackStepNode = ({
    comparableNodeId,
    nodeId,
}: {
    comparableNodeId: string;
    nodeId: string;
}) => {
    const selectedAttackStep = useSelectedAttackStep();
    const startAttackPath = useStartAttackPath();

    return React.useMemo(
        () =>
            !!startAttackPath &&
            [String(nodeId || ""), comparableNodeId].includes(
                String(selectedAttackStep?.nodeId || "")
            ),
        [comparableNodeId, nodeId, selectedAttackStep?.nodeId, startAttackPath]
    );
};

export const useSelectedEdgeEndpointNode = ({
    comparableNodeId,
    nodeId,
}: {
    comparableNodeId: string;
    nodeId: string;
}) => {
    const activeEdges = useActiveEdges();
    const targetEdgeId = useTargetEdgeId();

    return React.useMemo(() => {
        if (!targetEdgeId) {
            return false;
        }

        const selectedEdge = activeEdges.find((edge: DiagramEdge) => {
            const comparableEdgeId = String(edge.data?.["originalEdgeId"] || edge.id || "");
            return edge.id === targetEdgeId || comparableEdgeId === targetEdgeId;
        });

        if (!selectedEdge) {
            return false;
        }

        return [String(selectedEdge.source || ""), String(selectedEdge.target || "")].some(
            (sourceOrTargetNodeId) =>
                [String(nodeId || ""), comparableNodeId].includes(sourceOrTargetNodeId)
        );
    }, [activeEdges, comparableNodeId, nodeId, targetEdgeId]);
};

export const usePersistentSelectedNode = ({
    comparableNodeId,
    propsId,
}: {
    comparableNodeId: string;
    propsId: string;
}) => {
    const viewEdgeDetails = useDiagramViewEdgeDetails();
    const viewNodeDetails = useDiagramViewNodeDetails();
    const isDialogSelected = useDialogSelectedNode({
        comparableNodeId,
        nodeId: propsId,
    });
    const isSelectedEdgeEndpoint = useSelectedEdgeEndpointNode({
        comparableNodeId,
        nodeId: propsId,
    });
    const isSelectedAttackStepNode = useSelectedAttackStepNode({
        comparableNodeId,
        nodeId: propsId,
    });

    return React.useMemo(
        () =>
            isSelectedAttackStepNode ||
            (!!viewNodeDetails && isDialogSelected) ||
            (!!viewEdgeDetails && isSelectedEdgeEndpoint),
        [
            isDialogSelected,
            isSelectedAttackStepNode,
            isSelectedEdgeEndpoint,
            viewEdgeDetails,
            viewNodeDetails,
        ]
    );
};

// ==============================
// useMemo Hooks
// ==============================

export const useDeviceToInterfaceMapping = (): DeviceToInterfaceMappingSingle[] => {
    const draftCanvasRef = useDiagramDraftCanvasRef();

    return React.useMemo(() => {
        const cardRef = draftCanvasRef?.card_ref;

        if (!cardRef) {
            return [];
        }

        return getDeviceToInterfaceMappingFromCanvas(cardRef);
    }, [draftCanvasRef?.card_ref]);
};

export const useNextWarningFlterKey = () => {
    const warningFilterKey = useDiagramWarningFilterKey();

    return React.useMemo(() => getNextWarningFlterKey(warningFilterKey), [warningFilterKey]);
};

export const useNextWarningSortDirection = () => {
    const warningSortDirection = useDiagramWarningSortDirection();

    return React.useMemo(
        () => getNextWarningSortDirection(warningSortDirection),
        [warningSortDirection]
    );
};

export const useNodeHandleEdgeMappingResolver = () => {
    const instanceId = useDiagramInstanceId();

    return React.useMemo(
        () => new NodeHandleEdgeMappingResolver(instanceId), //
        [instanceId]
    );
};

export const useArchitectureCanvas = () => {
    const projectDiagram = useProjectDiagram();

    return React.useMemo<DiagramCanvas | undefined>(() => {
        return getArchitectureCanvas(projectDiagram);
    }, [projectDiagram]);
};

export const useArchitectureNodes = () => {
    const projectDiagram = useProjectDiagram();

    return React.useMemo<DiagramNode[]>(
        () => getArchitectureNodes(projectDiagram),
        [projectDiagram]
    );
};

export const useArchitectureEdges = () => {
    const projectDiagram = useProjectDiagram();

    return React.useMemo<DiagramEdge[]>(
        () => getArchitectureEdges(projectDiagram),
        [projectDiagram]
    );
};

export const useAllNodes = () => {
    const projectDiagram = useProjectDiagram();

    return React.useMemo<DiagramNode[]>(() => {
        return getAllNodes(projectDiagram);
    }, [projectDiagram]);
};

export const useAllEdges = () => {
    const projectDiagram = useProjectDiagram();

    return React.useMemo<DiagramEdge[]>(() => {
        return getAllEdges(projectDiagram);
    }, [projectDiagram]);
};

export const useBackendCanvasById = (canvasId?: string) => {
    const projectDiagram = useProjectDiagram();

    return React.useMemo(
        () =>
            getCanvasById({
                canvasId,
                projectDiagram,
            }),
        [canvasId, projectDiagram]
    );
};

export const useBackendSelectedCanvas = () => {
    const instanceId = useDiagramInstanceId();
    const projectDiagram = useProjectDiagram();

    return useSelector((state: RootState) =>
        getSelectedCanvas({
            diagramInstances: state.diagram.instances,
            instanceId,
            projectDiagram,
        })
    );
};

// ==============================
// useCallback Hooks
// ==============================

export const useGetNodeHandleEdgeMapping = () => {
    const nodeHandleEdgeMappingResolver = useNodeHandleEdgeMappingResolver();

    return React.useCallback(
        ({
            nodes, //
            edges,
        }: {
            nodes: DiagramNode[];
            edges: DiagramEdge[];
        }): NodeHandleEdgeMappingDict => nodeHandleEdgeMappingResolver.get({ nodes, edges }),
        [nodeHandleEdgeMappingResolver]
    );
};

export const useSetDiagramDrawerState = () => {
    const instanceId = useDiagramInstanceId();

    return React.useCallback(
        (value: Parameters<typeof setDiagramDrawerState>[0]) => {
            setDiagramDrawerState(value, instanceId); //
        },
        [instanceId]
    );
};

export const useSetDiagramDraftNode = () => {
    const instanceId = useDiagramInstanceId();

    return React.useCallback(
        (value: React.SetStateAction<DiagramNode | null>) => {
            setDiagramDraftNode(value, instanceId); //
        },
        [instanceId]
    );
};

export const useSetDiagramDraftEdge = () => {
    const instanceId = useDiagramInstanceId();

    return React.useCallback(
        (value: React.SetStateAction<DiagramEdge | null>) => {
            setDiagramDraftEdge(value, instanceId); //
        },
        [instanceId]
    );
};

export const useSetDiagramDraftNodeLabel = () => {
    const instanceId = useDiagramInstanceId();

    return React.useCallback(
        (value: React.SetStateAction<string>) => {
            setDiagramDraftNodeLabel(value, instanceId); //
        },
        [instanceId]
    );
};

export const useSetDiagramDraftEdgeLabel = () => {
    const instanceId = useDiagramInstanceId();

    return React.useCallback(
        (value: React.SetStateAction<string>) => {
            setDiagramDraftEdgeLabel(value, instanceId); //
        },
        [instanceId]
    );
};

export const useSetDiagramDraftNodeLoaded = () => {
    const instanceId = useDiagramInstanceId();

    return React.useCallback(
        (value: React.SetStateAction<boolean>) => {
            setDiagramDraftNodeLoaded(value, instanceId); //
        },
        [instanceId]
    );
};

export const useSetDiagramDraftNodeAttributes = () => {
    const instanceId = useDiagramInstanceId();

    return React.useCallback(
        (value: React.SetStateAction<DiagramElementAttributes | null>) => {
            setDiagramDraftNodeAttributes(value, instanceId); //
        },
        [instanceId]
    );
};

export const useSetDiagramDraftEdgeAttributes = () => {
    const instanceId = useDiagramInstanceId();

    return React.useCallback(
        (value: React.SetStateAction<DiagramElementAttributes | null>) => {
            setDiagramDraftEdgeAttributes(value, instanceId); //
        },
        [instanceId]
    );
};

export const useSetDiagramDraftEdgeLoaded = () => {
    const instanceId = useDiagramInstanceId();

    return React.useCallback(
        (value: React.SetStateAction<boolean>) => {
            setDiagramDraftEdgeLoaded(value, instanceId); //
        },
        [instanceId]
    );
};

export const useSetDiagramNodeDrawerDirty = () => {
    const instanceId = useDiagramInstanceId();

    return React.useCallback(
        (value: React.SetStateAction<boolean>) => {
            setDiagramIsNodeDrawerDirty(value, instanceId); //
        },
        [instanceId]
    );
};

export const useSetDiagramEdgeDrawerDirty = () => {
    const instanceId = useDiagramInstanceId();

    return React.useCallback(
        (value: React.SetStateAction<boolean>) => {
            setDiagramIsEdgeDrawerDirty(value, instanceId); //
        },
        [instanceId]
    );
};

export const useSetDiagramMiniMapExpanded = () => {
    const instanceId = useDiagramInstanceId();

    return React.useCallback(
        (value: Parameters<typeof setDiagramMiniMapExpanded>[0]) => {
            setDiagramMiniMapExpanded(value, instanceId); //
        },
        [instanceId]
    );
};

export const useSetDiagramSetupSelectedOption = () => {
    const instanceId = useDiagramInstanceId();

    return React.useCallback(
        (value: Parameters<typeof setDiagramSetupSelectedOption>[0]) => {
            setDiagramSetupSelectedOption(value, instanceId); //
        },
        [instanceId]
    );
};

export const useSetDiagramSetupPendingSelectedOption = () => {
    const instanceId = useDiagramInstanceId();

    return React.useCallback(
        (value: Parameters<typeof setDiagramSetupPendingSelectedOption>[0]) => {
            setDiagramSetupPendingSelectedOption(value, instanceId); //
        },
        [instanceId]
    );
};

export const useSetDiagramSetupSelectedTemplateCanvasId = () => {
    const instanceId = useDiagramInstanceId();

    return React.useCallback(
        (value: Parameters<typeof setDiagramSetupSelectedTemplateCanvasId>[0]) => {
            setDiagramSetupSelectedTemplateCanvasId(value, instanceId); //
        },
        [instanceId]
    );
};

export const useSetDiagramSetupNaturalLanguageDescription = () => {
    const instanceId = useDiagramInstanceId();

    return React.useCallback(
        (value: Parameters<typeof setDiagramSetupNaturalLanguageDescription>[0]) => {
            setDiagramSetupNaturalLanguageDescription(value, instanceId); //
        },
        [instanceId]
    );
};

export const useSetDiagramUserStoryPendingSelectedDataNodes = (dataNodeId: string | undefined) => {
    const instanceId = useDiagramInstanceId();

    return React.useCallback(
        (value: React.SetStateAction<OptionLabel[]>) => {
            if (!dataNodeId) return;

            setDiagramUserStoryPendingSelectedDataNodesMapping(
                (prev) => ({
                    ...prev,
                    [dataNodeId]: resolveNextStateAction(value, prev[dataNodeId] ?? []),
                }),
                instanceId
            );
        },
        [dataNodeId, instanceId]
    );
};

export const useSetDiagramUserStoryPendingSelectedDataNodesMapping = () => {
    const instanceId = useDiagramInstanceId();

    return React.useCallback(
        (value: Parameters<typeof setDiagramUserStoryPendingSelectedDataNodesMapping>[0]) => {
            setDiagramUserStoryPendingSelectedDataNodesMapping(value, instanceId); //
        },
        [instanceId]
    );
};

export const useSetDiagramUserStoryNodesPositionApplyToAll = () => {
    const instanceId = useDiagramInstanceId();

    return React.useCallback(
        (value: Parameters<typeof setDiagramUserStoryNodesPositionApplyToAll>[0]) => {
            setDiagramUserStoryNodesPositionApplyToAll(value, instanceId); //
        },
        [instanceId]
    );
};

export const useSetDiagramUserStoryCanvasColumnButtonSelectedPositionMapping = () => {
    const instanceId = useDiagramInstanceId();

    return React.useCallback(
        (
            value: Parameters<
                typeof setDiagramUserStoryCanvasColumnButtonSelectedPositionMapping
            >[0]
        ) => {
            setDiagramUserStoryCanvasColumnButtonSelectedPositionMapping(value, instanceId); //
        },
        [instanceId]
    );
};

export const useSetDiagramUserStoryCanvasColumnButtonSelectedPosition = (
    nodeId: string | undefined
) => {
    const setSelectedPositionMapping =
        useSetDiagramUserStoryCanvasColumnButtonSelectedPositionMapping();
    const key = nodeId ?? USER_STORY_CANVAS_COLUMN_ALL_KEY;

    return React.useCallback(
        (value: React.SetStateAction<CanvasColumn | undefined>) => {
            setSelectedPositionMapping((prev) => ({
                ...prev,
                [key]: resolveNextStateAction(value, prev[key]),
            }));
        },
        [key, setSelectedPositionMapping]
    );
};

export const useSetDiagramSelectedTabGroup = () => {
    const instanceId = useDiagramInstanceId();

    return React.useCallback(
        (value: Parameters<typeof setDiagramSelectedTabGroup>[0]) => {
            setDiagramSelectedTabGroup(value, instanceId); //
        },
        [instanceId]
    );
};

export const useSetDiagramSelectedDataflowCanvasId = () => {
    const instanceId = useDiagramInstanceId();

    return React.useCallback(
        (value: Parameters<typeof setDiagramSelectedDataflowCanvasId>[0]) => {
            setDiagramSelectedDataflowCanvasId(value, instanceId); //
        },
        [instanceId]
    );
};

export const useSetDiagramEditToolbarState = () => {
    const instanceId = useDiagramInstanceId();

    return React.useCallback(
        (value: React.SetStateAction<DiagramEditToolbarState>) => {
            setDiagramEditToolbarState(value, instanceId); //
        },
        [instanceId]
    );
};

export const useSetDiagramResourceDrawerSelected = () => {
    const instanceId = useDiagramInstanceId();

    return React.useCallback(
        (value: Parameters<typeof setDiagramResourceDrawerSelected>[0]) => {
            setDiagramResourceDrawerSelected(value, instanceId); //
        },
        [instanceId]
    );
};

export const useSetDiagramResourceDrawerSearchStrings = () => {
    const instanceId = useDiagramInstanceId();

    return React.useCallback(
        (value: Parameters<typeof setDiagramResourceDrawerSearchStrings>[0]) => {
            setDiagramResourceDrawerSearchStrings(value, instanceId); //
        },
        [instanceId]
    );
};

export const useSetDiagramResourceDrawerViewMode = () => {
    const instanceId = useDiagramInstanceId();

    return React.useCallback(
        (value: Parameters<typeof setDiagramResourceDrawerViewMode>[0]) => {
            setDiagramResourceDrawerViewMode(value, instanceId); //
        },
        [instanceId]
    );
};

export const useSetDiagramIsAttributeDrawerOpen = () => {
    const instanceId = useDiagramInstanceId();

    return React.useCallback(
        (value: Parameters<typeof setDiagramIsAttributeDrawerOpen>[0]) => {
            setDiagramIsAttributeDrawerOpen(value, instanceId); //
        },
        [instanceId]
    );
};

export const useSetDiagramHiddenEdgeIds = () => {
    const instanceId = useDiagramInstanceId();

    return React.useCallback(
        (value: Parameters<typeof setDiagramHiddenEdgeIds>[0]) => {
            setDiagramHiddenEdgeIds(value, instanceId); //
        },
        [instanceId]
    );
};

export const useSetDiagramLineSegments = () => {
    const instanceId = useDiagramInstanceId();

    return React.useCallback(
        (value: React.SetStateAction<Record<string, LineSegment[]>>) => {
            setDiagramLineSegments(value, instanceId); //
        },
        [instanceId]
    );
};

export const useSetDiagramEdgeSegmentedPaths = () => {
    const instanceId = useDiagramInstanceId();

    return React.useCallback(
        (value: React.SetStateAction<Record<string, string>>) => {
            setDiagramEdgeSegmentedPaths(value, instanceId); //
        },
        [instanceId]
    );
};

export const useSetDiagramEdgeSegmentedPath = () => {
    const instanceId = useDiagramInstanceId();

    return React.useCallback(
        (edgeId: string, value: React.SetStateAction<string>) => {
            setDiagramEdgeSegmentedPath(edgeId, value, instanceId); //
        },
        [instanceId]
    );
};

export const useSetDiagramIsConnecting = () => {
    const instanceId = useDiagramInstanceId();

    return React.useCallback(
        (value: Parameters<typeof setDiagramIsConnecting>[0]) => {
            setDiagramIsConnecting(value, instanceId); //
        },
        [instanceId]
    );
};

export const useSetDiagramView = () => {
    return React.useCallback((value: Parameters<typeof setDiagramView>[0]) => {
        setDiagramView(value);
    }, []);
};

export const useSetDiagramJoyrideViewType = () => {
    const instanceId = useDiagramInstanceId();

    return React.useCallback(
        (value: Parameters<typeof setDiagramJoyrideViewType>[0]) => {
            setDiagramJoyrideViewType(value, instanceId); //
        },
        [instanceId]
    );
};

export const useSetDiagramIsConnectingHandleType = () => {
    const instanceId = useDiagramInstanceId();

    return React.useCallback(
        (value: Parameters<typeof setDiagramIsConnectingHandleType>[0]) => {
            setDiagramIsConnectingHandleType(value, instanceId); //
        },
        [instanceId]
    );
};

export const useSetDiagramSelectedNodeIdList = () => {
    const instanceId = useDiagramInstanceId();

    return React.useCallback(
        (value: Parameters<typeof setDiagramSelectedNodeIdList>[0]) => {
            setDiagramSelectedNodeIdList(value, instanceId); //
        },
        [instanceId]
    );
};

export const useSetDiagramCanvasHistory = () => {
    const instanceId = useDiagramInstanceId();

    return React.useCallback(
        (value: React.SetStateAction<DiagramCanvas[]>) => {
            setDiagramCanvasHistory(value, instanceId); //
        },
        [instanceId]
    );
};

export const useSetDiagramCanvasHistoryIndex = () => {
    const instanceId = useDiagramInstanceId();

    return React.useCallback(
        (value: React.SetStateAction<number>) => {
            setDiagramCanvasHistoryIndex(value, instanceId); //
        },
        [instanceId]
    );
};

export const useSetDiagramSelectedEdgeIdList = () => {
    const instanceId = useDiagramInstanceId();

    return React.useCallback(
        (value: Parameters<typeof setDiagramSelectedEdgeIdList>[0]) => {
            setDiagramSelectedEdgeIdList(value, instanceId); //
        },
        [instanceId]
    );
};

export const useSetDiagramWarningListMapping = () => {
    const instanceId = useDiagramInstanceId();

    return React.useCallback(
        (value: Parameters<typeof setDiagramWarningListMapping>[0]) => {
            setDiagramWarningListMapping(value, instanceId); //
        },
        [instanceId]
    );
};

export const useSetDiagramToscaReportMapping = () => {
    const instanceId = useDiagramInstanceId();

    return React.useCallback(
        (value: Parameters<typeof setDiagramToscaReportMapping>[0]) => {
            setDiagramToscaReportMapping(value, instanceId); //
        },
        [instanceId]
    );
};

export const useSetDiagramWarningFilterKey = () => {
    const instanceId = useDiagramInstanceId();

    return React.useCallback(
        (value: Parameters<typeof setDiagramWarningFilterKey>[0]) => {
            setDiagramWarningFilterKey(value, instanceId); //
        },
        [instanceId]
    );
};

export const useSetDiagramWarningSortDirection = () => {
    const instanceId = useDiagramInstanceId();

    return React.useCallback(
        (value: Parameters<typeof setDiagramWarningSortDirection>[0]) => {
            setDiagramWarningSortDirection(value, instanceId); //
        },
        [instanceId]
    );
};

export const useToggleWarningFilterKey = () => {
    const nextWarningFlterKey = useNextWarningFlterKey();
    const setDiagramWarningFilterKey = useSetDiagramWarningFilterKey();

    return React.useCallback(() => {
        setDiagramWarningFilterKey(nextWarningFlterKey);
    }, [nextWarningFlterKey, setDiagramWarningFilterKey]);
};

export const useToggleSortDirection = () => {
    const nextWarningSortDirection = useNextWarningSortDirection();
    const setDiagramWarningSortDirection = useSetDiagramWarningSortDirection();

    return React.useCallback(() => {
        setDiagramWarningSortDirection(nextWarningSortDirection);
    }, [nextWarningSortDirection, setDiagramWarningSortDirection]);
};

export const useSetDiagramWarningList = () => {
    const instanceId = useDiagramInstanceId();

    return React.useCallback(
        (value: Parameters<typeof setDiagramWarningList>[0]) => {
            setDiagramWarningList(value, instanceId); //
        },
        [instanceId]
    );
};

export const useSetDiagramWarningSortCriteria = () => {
    const instanceId = useDiagramInstanceId();

    return React.useCallback(
        (value: Parameters<typeof setDiagramWarningSortCriteria>[0]) => {
            setDiagramWarningSortCriteria(value, instanceId); //
        },
        [instanceId]
    );
};

export const useSetDiagramHiddenWarningIdList = () => {
    const instanceId = useDiagramInstanceId();

    return React.useCallback(
        (value: Parameters<typeof setDiagramHiddenWarningIdList>[0]) => {
            setDiagramHiddenWarningIdList(value, instanceId); //
        },
        [instanceId]
    );
};
