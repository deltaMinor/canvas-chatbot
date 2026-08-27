import { MarkerType, Position } from "@xyflow/react";

import {
    CanvasEdgeType,
    CanvasType,
    DiagramCanvas,
    DiagramNode,
    EdgeHandleMapping,
    EdgeHandleType,
    LineSegment,
    NodeHandleEdgeMappingDict,
    UserStoryCardRefEnum,
    WarningReport,
} from "#root/interfaces/diagram";
import { UuidIdentifierKey } from "#root/interfaces/identifier";
import {
    AWSClusterNodeIconKey,
    AWSDeveloperToolsNodeIconKey,
    GenericClusterNodeIconKey,
    GenericSystemNodeIconKey,
} from "#root/interfaces/svg";
import { DiagramEditToolbarState } from "#root/redux/projectDiagramFeatureSlice";
import { generateUUID } from "#root/utils/identifierUtil";

export const DEFAULT_ZINDEX_EDGE = 100; // Edges must render above Nodes to be clickable within a Cluster
export const DEFAULT_ZINDEX_NODE = 1;
export const DEFAULT_ZINDEX_CLUSTER_NODE = 1;
export const DEFAULT_ZINDEX_DIAGRAM_DRAWER = 1120;
export const DEFAULT_ZINDEX_CANVAS_BACKDROP = 1;
export const DEFAULT_ZINDEX_HANDLE_TOP = 19;
export const DEFAULT_ZINDEX_HANDLE_BTM = 18;

export const DEFAULT_DRAG_INTERVAL = 5;
export const DEFAULT_LINE_SEGMENT_THICKNESS = 5;
export const DEFAULT_BADGE_ZINDEX = 1050;
export const DEFAULT_GAP_OFFSET = 15;

//
export const MIN_HEIGHT_INFONODE = 80;
export const MIN_WIDTH_INFONODE = 80;
export const STAGGER_SPACING = 15;

//
export const SUMMARY_DEVICE_NODE_OFFSET_X = 30;
export const SUMMARY_DEVICE_NODE_OFFSET_Y = 30;
export const SUMMARY_DEVICE_NODE_SPACING_X = 60;
export const SUMMARY_DEVICE_NODE_SPACING_Y = 60;
export const SUMMARY_DEVICE_NODE_SPACING_Y_TOP = 20;
export const SUMMARY_INTERFACE_NODE_SPACING_X = 60;
export const SUMMARY_INTERFACE_NODE_SPACING_Y = 60;
export const SUMMARY_NODE_COLUMN_SPACING_X = 100;
export const SUMMARY_NODE_COLUMN_SPACING_Y = 100;
export const SUMMARY_USER_NODE_OFFSET_X = 20;
export const SUMMARY_USER_NODE_OFFSET_Y = 20;
export const SUMMARY_USER_NODE_SPACING_X = 60;
export const SUMMARY_USER_NODE_SPACING_Y = 60;

//
export const SUMMARY_DEVICE_NODE_WIDTH = 200;
export const SUMMARY_DEVICE_NODE_HEIGHT = 200;
export const SUMMARY_USER_NODE_WIDTH = 80;
export const SUMMARY_USER_NODE_HEIGHT = 80;
export const SUMMARY_INTERFACE_NODE_WIDTH = 80;
export const SUMMARY_INTERFACE_NODE_HEIGHT = 80;

//
export const DESELECTED_EDGE_OPACITY = 0.1;
export const DESELECTED_NODE_OPACITY = 0.6;
export const SELECTED_NODE_EDGE_OPACITY = 1;
export const DEFAULT_EDGE_HANDLE_ORTHO_OFFSET = 2;

//
export const VERTICAL_PASTE_OFFSET = 20;
export const HORIZONTAL_PASTE_OFFSET = 20;

export const MAX_CANVAS_DATA_HISTORY_ITEMS = 5;

export const EMPTY_DIAGRAM_CANVAS_HISTORY: DiagramCanvas[] = [];
export const EMPTY_DIAGRAM_LINE_SEGMENTS: Record<string, LineSegment[]> = {};
export const EMPTY_DIAGRAM_EDGE_SEGMENTED_PATHS: Record<string, string> = {};
export const EMPTY_NODE_HANDLE_EDGE_MAPPING: NodeHandleEdgeMappingDict = {};
export const EMPTY_TOSCA_REPORT_MAPPING: { [id: string]: WarningReport[] } = {};
export const DEFAULT_DIAGRAM_EDIT_TOOLBAR_STATE: DiagramEditToolbarState = {
    general: false,
    delete: false,
    alignment: false,
    distribution: false,
    layering: false,
};

export const DEFAULT_ICON_NODE_HEIGHT = 80;
export const DEFAULT_ICON_NODE_WIDTH = 80;
export const DEFAULT_CLUSTER_NODE_HEIGHT = 200;
export const DEFAULT_CLUSTER_NODE_WIDTH = 200;
export const DEFAULT_HANDLE_SIZE = 10;

// Cluster Node Size
export const MIN_WIDTH_CLUSTERNODE = 100;
export const MIN_HEIGHT_CLUSTERNODE = 100;
export const MAX_WIDTH_CLUSTERNODE = 2000;
export const MAX_HEIGHT_CLUSTERNODE = 2000;

export const CanvasEdgeColor = {
    [CanvasEdgeType.architecture]: "#000",
};

export const default_marker_props = {
    type: MarkerType.ArrowClosed,
    color: "#000",
};

export const default_edge = {
    id: generateUUID(UuidIdentifierKey.diagramEdge),
    source: "",
    sourceHandle: "",
    target: "",
    targetHandle: "",
    label: "",
    className: "",
    type: "smoothstep",
    animated: false,
    data: {},
    deletable: true,
    hidden: false,
    interactionWidth: 20,
    labelBgBorderRadius: 2,
    labelBgPadding: [6, 2] as [number, number],
    labelBgStyle: {},
    labelShowBg: true,
    labelStyle: {},
    markerEnd: default_marker_props,
    style: {
        strokeWidth: 2,
        stroke: "black",
    },
    zIndex: DEFAULT_ZINDEX_EDGE,
};

export const default_node: DiagramNode = {
    ariaLabel: "",
    className: "",
    connectable: true,
    data: {},
    deletable: true,
    draggable: true,
    dragHandle: "",
    expandParent: false,
    hidden: false,
    id: generateUUID(UuidIdentifierKey.diagramNode),
    parentId: "",
    position: { x: 0, y: 0 },
    origin: [0, 0],
    resizing: true,
    selectable: true,
    sourcePosition: Position.Bottom,
    style: {},
    targetPosition: Position.Top,
    type: "default",
    zIndex: DEFAULT_ZINDEX_NODE,
};

export const default_canvas: DiagramCanvas[] = [
    {
        canvas_id: generateUUID(UuidIdentifierKey.diagramCanvas),
        canvas_name: "Architecture",
        canvas_type: CanvasType.architecture,
        edges: [],
        nodes: [],
        ref: {},
        view_only: false,
        viewport: { x: 0, y: 0, zoom: 1 },
        warnings: [],
        llm_generation_status: 0,
    },
];

export const ALLOWED_CHILD_NODES = {
    // These must be place in the cluster
    [GenericClusterNodeIconKey.cicd]: [
        AWSDeveloperToolsNodeIconKey.codeArtifact.toString(),
        AWSDeveloperToolsNodeIconKey.codeBuild.toString(),
        AWSDeveloperToolsNodeIconKey.codeCatalyst.toString(),
        AWSDeveloperToolsNodeIconKey.codeCommit.toString(), //
        AWSDeveloperToolsNodeIconKey.codeDeploy.toString(),
        AWSDeveloperToolsNodeIconKey.codePipeline.toString(),
    ],
    [AWSClusterNodeIconKey.codePipelineCluster]: [
        AWSDeveloperToolsNodeIconKey.codeArtifact.toString(),
        AWSDeveloperToolsNodeIconKey.codeBuild.toString(),
        AWSDeveloperToolsNodeIconKey.codeCatalyst.toString(),
        AWSDeveloperToolsNodeIconKey.codeCommit.toString(), //
        AWSDeveloperToolsNodeIconKey.codeDeploy.toString(),
        AWSDeveloperToolsNodeIconKey.codePipeline.toString(),
    ],
};

export const ALLOWED_PARENT_NODES = {
    [AWSDeveloperToolsNodeIconKey.codeArtifact]: [
        GenericClusterNodeIconKey.cicd.toString(), //
        AWSClusterNodeIconKey.codePipelineCluster.toString(),
    ],
    [AWSDeveloperToolsNodeIconKey.codeBuild]: [
        GenericClusterNodeIconKey.cicd.toString(), //
        AWSClusterNodeIconKey.codePipelineCluster.toString(),
    ],
    [AWSDeveloperToolsNodeIconKey.codeCatalyst]: [
        GenericClusterNodeIconKey.cicd.toString(), //
        AWSClusterNodeIconKey.codePipelineCluster.toString(),
    ],
    [AWSDeveloperToolsNodeIconKey.codeCommit]: [
        GenericClusterNodeIconKey.cicd.toString(), //
        AWSClusterNodeIconKey.codePipelineCluster.toString(),
    ],
    [AWSDeveloperToolsNodeIconKey.codeDeploy]: [
        GenericClusterNodeIconKey.cicd.toString(), //
        AWSClusterNodeIconKey.codePipelineCluster.toString(),
    ],
    [AWSDeveloperToolsNodeIconKey.codePipeline]: [
        GenericClusterNodeIconKey.cicd.toString(), //
        AWSClusterNodeIconKey.codePipelineCluster.toString(),
    ],
};

export const ALLOWED_CHILD_NODE_CARD_REF_KEYS = {
    [UserStoryCardRefEnum.card_devices]: [
        UserStoryCardRefEnum.card_interface.toString(), //
    ],
};

export const ALLOWED_PARENT_NODE_CARD_REF_KEYS = {
    [UserStoryCardRefEnum.card_interface]: [
        UserStoryCardRefEnum.card_devices.toString(), //
    ],
};

export const HIDDEN_RESOURCE_DRAWER_NODE_ICON_KEY = [
    GenericSystemNodeIconKey.forums.toString(), //
];

export const CLUSTER_NODE_BORDER_COLOR = {
    // AWS
    [AWSClusterNodeIconKey.autoScalingGroup]: "#d8661333",
    [AWSClusterNodeIconKey.awsAccount]: "#cd226433",
    [AWSClusterNodeIconKey.awsCloud]: "#232f3e33",
    [AWSClusterNodeIconKey.awsStepFunctionsWorkflow]: "#cd226433",
    [AWSClusterNodeIconKey.awsSubnet]: "#232f3e33",
    [AWSClusterNodeIconKey.codePipelineCluster]: "#2e27ad33",
    [AWSClusterNodeIconKey.dataPipelineCluster]: "#4d27a833",
    [AWSClusterNodeIconKey.elasticBeanstalkContainer]: "#d8661333",
    [AWSClusterNodeIconKey.privateSubnet]: "#00a4a633",
    [AWSClusterNodeIconKey.publicSubnet]: "#7aa11633",
    [AWSClusterNodeIconKey.region]: "#00a4a633",
    [AWSClusterNodeIconKey.spotFleet]: "#d8661333",
    [AWSClusterNodeIconKey.kubernetesCluster]: "#32659133",
    [AWSClusterNodeIconKey.vpcCluster]: "#24881433",

    // Generic
    [GenericClusterNodeIconKey.cicd]: "#5a6c8633",
    [GenericClusterNodeIconKey.genericCloud]: "#232f3e33",
    [GenericClusterNodeIconKey.genericCodePipeline]: "#5a6c8633",
    [GenericClusterNodeIconKey.genericDataPipeline]: "#5a6c8633",
    [GenericClusterNodeIconKey.genericServerCluster]: "#5a6c8633",
    [GenericClusterNodeIconKey.genericSubnet]: "#5a6c8633",
    [GenericClusterNodeIconKey.genericVPC]: "#5a6c8633",
    [GenericClusterNodeIconKey.genericWirelessSubnet]: "#5a6c8633",
    [GenericClusterNodeIconKey.onPremisesCompute]: "#5a6c8633",
    [GenericClusterNodeIconKey.onPremisesEnvironment]: "#5a6c8633",
};

export const CLUSTER_NODE_BORDER_STYLE = {
    [AWSClusterNodeIconKey.autoScalingGroup]: "dashed",
    [AWSClusterNodeIconKey.region]: "dashed",
};

export const CLUSTER_NODE_BACKGROUNDCOLOR = {
    // AWS
    [AWSClusterNodeIconKey.autoScalingGroup]: "#d8661310",
    [AWSClusterNodeIconKey.awsAccount]: "#cd226410",
    [AWSClusterNodeIconKey.awsCloud]: "#232f3e10",
    [AWSClusterNodeIconKey.awsStepFunctionsWorkflow]: "#cd226410",
    [AWSClusterNodeIconKey.awsSubnet]: "#232f3e10",
    [AWSClusterNodeIconKey.codePipelineCluster]: "#2e27ad10",
    [AWSClusterNodeIconKey.dataPipelineCluster]: "#4d27a810",
    [AWSClusterNodeIconKey.elasticBeanstalkContainer]: "#d8661310",
    [AWSClusterNodeIconKey.privateSubnet]: "#00a4a610",
    [AWSClusterNodeIconKey.publicSubnet]: "#7aa11610",
    [AWSClusterNodeIconKey.region]: "#00a4a610",
    [AWSClusterNodeIconKey.spotFleet]: "#d8661310",
    [AWSClusterNodeIconKey.kubernetesCluster]: "#32659110",
    [AWSClusterNodeIconKey.vpcCluster]: "#24881410",

    // Generic
    [GenericClusterNodeIconKey.cicd]: "#5a6c8633",
    [GenericClusterNodeIconKey.genericCloud]: "#232f3e33",
    [GenericClusterNodeIconKey.genericCodePipeline]: "#5a6c8633",
    [GenericClusterNodeIconKey.genericDataPipeline]: "#5a6c8633",
    [GenericClusterNodeIconKey.genericServerCluster]: "#5a6c8633",
    [GenericClusterNodeIconKey.genericSubnet]: "#5a6c8633",
    [GenericClusterNodeIconKey.genericVPC]: "#5a6c8633",
    [GenericClusterNodeIconKey.genericWirelessSubnet]: "#5a6c8633",
    [GenericClusterNodeIconKey.onPremisesCompute]: "#5a6c8633",
    [GenericClusterNodeIconKey.onPremisesEnvironment]: "#5a6c8633",
};

export const CLUSTER_NODE_BORDER_WIDTH = {} as Record<string, string>;

export const architectureEdgeHandleMapping: EdgeHandleMapping = {
    source_top: EdgeHandleType.source_top,
    target_top: EdgeHandleType.target_top,
    source_bottom: EdgeHandleType.source_bottom,
    target_bottom: EdgeHandleType.target_bottom,
    source_left: EdgeHandleType.source_left,
    target_left: EdgeHandleType.target_left,
    source_right: EdgeHandleType.source_right,
    target_right: EdgeHandleType.target_right,
};

export const pathEdgeHandleMapping: EdgeHandleMapping = {
    source_top: EdgeHandleType.attack_source_top,
    target_top: EdgeHandleType.attack_target_top,
    source_bottom: EdgeHandleType.attack_source_bottom,
    target_bottom: EdgeHandleType.attack_target_bottom,
    source_left: EdgeHandleType.attack_source_left,
    target_left: EdgeHandleType.attack_target_left,
    source_right: EdgeHandleType.attack_source_right,
    target_right: EdgeHandleType.attack_target_right,
};
