import React from "react";

import { HandleType } from "@xyflow/react";

import { IsAuthorized } from "#root/interfaces/authorization";
import {
    CanvasType,
    DiagramCanvas,
    DiagramEdge,
    DiagramNode,
    NodeAttackStepCountMapping,
    NodeHandleEdgeMappingDict,
    ProjectDiagram,
    SortDirection,
    WarningFilterKey,
    WarningReport,
    WarningSortCriteriaKey,
} from "#root/interfaces/diagram";
import { NodeAttackPathMapping } from "#root/interfaces/mitre";
import { AttackStep } from "#root/interfaces/register";
import {
    DiagramEditToolbarState,
    DiagramInstanceState,
} from "#root/redux/projectDiagramFeatureSlice";
import app_store, { app_actions } from "#root/redux/store";
import {
    selectBackendProjectDiagram,
    selectBackendProjectDiagramIsAuthorized,
    selectBackendProjectId,
} from "#root/selectors/backendSelectors";
import {
    selectDiagramInstanceState,
    selectDraftCanvasId,
} from "#root/selectors/projectDiagramFeatureSelectors";
import {
    getAllEdges,
    getAllNodes,
    getArchitectureCanvas,
    getArchitectureEdges,
    getArchitectureNodes,
    getCanvasById,
    getSelectedCanvas,
} from "#root/utils/diagram/backendDiagramUtil";
import { resolveNextStateAction } from "#root/utils/diagram/diagramStoreUtil";

import { getRootStateFromStore } from "../root";

export const getBackendProjectDiagramFromStore = (): ProjectDiagram => {
    const projectDiagram = selectBackendProjectDiagram(getRootStateFromStore());
    if (!projectDiagram) {
        throw new Error("Project diagram not found.");
    }
    return projectDiagram;
};

export const setBackendProjectDiagram = (value: React.SetStateAction<ProjectDiagram>) => {
    const currentProjectDiagram = getBackendProjectDiagramFromStore();
    const nextProjectDiagram = resolveNextStateAction(value, currentProjectDiagram);
    app_store.dispatch(app_actions.backend.setProjectDiagram(nextProjectDiagram));
};

export const getBackendProjectDiagramIsAuthorizedFromStore = (): IsAuthorized => {
    return selectBackendProjectDiagramIsAuthorized(getRootStateFromStore());
};

export const getBackendProjectIdFromStore = (): string => {
    return selectBackendProjectId(getRootStateFromStore());
};

export const getBackendArchitectureCanvasFromStore = (): DiagramCanvas | undefined => {
    return getArchitectureCanvas(selectBackendProjectDiagram(getRootStateFromStore()));
};

export const getInitialDiagramCanvasStateFromStore = (): DiagramInstanceState => {
    return {
        canvasHistory: [],
        canvasHistoryIndex: 0,
        selectedNodeIdList: [],
        selectedEdgeIdList: [],
        miniMapExpanded: false,
        setupPendingSelectedOption: "",
        setupSelectedOption: "",
        setupSelectedTemplateCanvasId: "",
        userStoryPendingSelectedDataNodesMapping: {},
        userStoryNodesPositionApplyToAll: false,
        userStoryCanvasColumnButtonSelectedPositionMapping: {},
        hiddenEdgeIds: [],
        warningListMapping: {},
        toscaReportMapping: {} as { [id: string]: WarningReport[] },
        warningFilterKey: WarningFilterKey.show_default.toString(),
        warningSortDirection: SortDirection.ascending,
        warningSortCriteria: WarningSortCriteriaKey.priority.toString(),
        hiddenWarningIdList: [],
        warningList: [],
        isConnecting: false,
        isConnectingHandleType: "source" as HandleType,
        overlayEdges: [] as DiagramEdge[],
        overlayNodes: [] as DiagramNode[],
        lineSegments: {},
        nodeHandleEdgeMapping: {} as NodeHandleEdgeMappingDict,
        edgeSegmentedPaths: {},
        draftCanvasId: "",
        viewSelectDisabled: false,
        pendingDrawerKey: null,
        requestedThreatScenarioDrawerKey: null,
        biDirectionalArrow: false,
        canvasInit: false,
        selectedPathId: "",
        pathSelectDisabled: false,
        draftCanvas: undefined as DiagramCanvas | undefined,
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
        backendSaveEnabled: true,
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
        } as DiagramEditToolbarState,
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
            label: "General",
            value: "general",
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
                setComplete: { show: false, enabled: false },
                unsetComplete: { show: false, enabled: false },
                tutorial: { show: false, enabled: false },
                undo: { show: false, enabled: false },
                redo: { show: false, enabled: false },
                biDirectionalArrow: { show: false, enabled: false },
                nodeDrawerSave: { show: false, enabled: false },
                edgeDrawerSave: { show: false, enabled: false },
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
    };
};

export const getBackendArchitectureNodesFromStore = (): DiagramNode[] => {
    return getArchitectureNodes(selectBackendProjectDiagram(getRootStateFromStore()));
};

export const getBackendArchitectureEdgesFromStore = (): DiagramEdge[] => {
    return getArchitectureEdges(selectBackendProjectDiagram(getRootStateFromStore()));
};

export const getBackendAllNodesFromStore = (): DiagramNode[] => {
    return getAllNodes(selectBackendProjectDiagram(getRootStateFromStore()));
};

export const getBackendAllEdgesFromStore = (): DiagramEdge[] => {
    return getAllEdges(selectBackendProjectDiagram(getRootStateFromStore()));
};

export const getBackendCanvasByIdFromStore = (canvasId?: string): DiagramCanvas | undefined => {
    return getCanvasById({
        canvasId,
        projectDiagram: selectBackendProjectDiagram(getRootStateFromStore()),
    });
};

export const getDraftCanvasIdFromStore = (instanceId: string): string | null => {
    return selectDraftCanvasId(getRootStateFromStore(), instanceId) ?? null;
};

export const getDiagramInstanceStateFromStore = (instanceId: string): DiagramInstanceState => {
    return selectDiagramInstanceState(getRootStateFromStore(), instanceId);
};

export const getBackendSelectedCanvasFromStore = (
    instanceId: string
): DiagramCanvas | undefined => {
    const state = getRootStateFromStore();
    return getSelectedCanvas({
        diagramInstances: state.diagram.instances,
        instanceId,
        projectDiagram: selectBackendProjectDiagram(state),
    });
};
