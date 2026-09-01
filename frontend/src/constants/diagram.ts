import { MarkerType, Position } from "@xyflow/react";

import {
    CanvasEdgeType,
    CanvasType,
    DiagramCanvas,
    DiagramNode,
    LineSegment,
    NodeHandleEdgeMappingDict,
    WarningReport,
} from "#root/interfaces/diagram";
import { UuidIdentifierKey } from "#root/interfaces/identifier";
import { DiagramEditToolbarState } from "#root/redux/projectDiagramFeatureSlice";
import { generateUUID } from "#root/utils/identifierUtil";

export const DEFAULT_ZINDEX_EDGE = 100; // Edges must render above Nodes to be clickable within a Cluster
export const DEFAULT_ZINDEX_NODE = 1;
export const DEFAULT_ZINDEX_DIAGRAM_DRAWER = 1120;
export const DEFAULT_ZINDEX_HANDLE_TOP = 19;
export const DEFAULT_ZINDEX_HANDLE_BTM = 18;

export const DEFAULT_BADGE_ZINDEX = 1050;
export const DEFAULT_GAP_OFFSET = 15;

//
export const STAGGER_SPACING = 15;

//
export const SUMMARY_DEVICE_NODE_OFFSET_X = 30;
export const SUMMARY_DEVICE_NODE_OFFSET_Y = 30;
export const SUMMARY_DEVICE_NODE_SPACING_X = 60;
export const SUMMARY_DEVICE_NODE_SPACING_Y = 60;
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
