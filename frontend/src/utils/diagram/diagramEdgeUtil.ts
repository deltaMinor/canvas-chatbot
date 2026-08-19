import {
    Edge,
    EdgeMarker,
    EdgeProps,
    Position,
    XYPosition,
    getSmoothStepPath,
} from "@xyflow/react";

import {
    CanvasEdgeColor,
    DEFAULT_EDGE_HANDLE_ORTHO_OFFSET,
    DEFAULT_GAP_OFFSET,
    DEFAULT_ZINDEX_EDGE,
    DESELECTED_EDGE_OPACITY,
    SELECTED_NODE_EDGE_OPACITY,
    STAGGER_SPACING,
    default_edge,
    default_marker_props,
} from "#root/constants/diagram";
import { IsAuthorized } from "#root/interfaces/authorization";
import {
    CanvasEdgeType,
    CanvasNodeType,
    CanvasType,
    DiagramCanvas,
    DiagramEdge,
    DiagramNode,
    EdgeHandleType,
    EdgeVisibilityFuncProps,
    NodeHandleEdgeMappingDict,
    ProjectDiagram,
} from "#root/interfaces/diagram";
import { AttackPath } from "#root/interfaces/register";

import { getNodePositionAbsolute } from "./diagramNodePositionUtil";
import { getPositionFromHandleId } from "./diagramNodeUtil";

export const getAllPathEdgeIds = (
    canvas: DiagramCanvas[] //
) => {
    const pathEdges =
        canvas?.flatMap((c) => {
            const attackPaths = c.ref?.threat_scenario_ref?.attackPaths || [];
            return attackPaths.flatMap((p) => p.edges) || [];
        }) || [];
    return Array.from(new Set(pathEdges));
};

const getComparableEdgeId = (edge: DiagramEdge) => {
    return `${edge?.data?.["originalEdgeId"] || edge?.id || ""}`;
};

export const getAuthorizedEdges = (
    _edges: DiagramEdge[], //
    _isAuthorized?: IsAuthorized
) => {
    if (!!_isAuthorized?.update) return _edges;
    return _edges?.map((edge) => {
        return {
            ...edge,
            deletable: false,
            focusable: false,
            selectable: false,
        };
    });
};

export const getSelectedViewEdges = (
    edges: DiagramEdge[], //
    canvas: DiagramCanvas[],
    getEdgePropsFunc: (
        props: EdgeVisibilityFuncProps //
    ) => Partial<DiagramEdge> = () => {
        return {};
    },
    selectedCanvas?: DiagramCanvas,
    selectedCanvasViewOnly?: boolean,
    selectedPath?: AttackPath,
    viewAllPaths?: boolean
) => {
    return edges?.map((edge) => {
        const props: EdgeVisibilityFuncProps = {
            edge,
            canvas,
            selectedCanvasViewOnly,
        };
        if (selectedCanvas) props.selectedCanvas = selectedCanvas;
        if (selectedPath) props.selectedPath = selectedPath;
        if (viewAllPaths !== undefined) props.viewAllPaths = viewAllPaths;

        const {
            style: edgeProps__style = {}, //
            ...edgeProps
        } = getEdgePropsFunc(props);

        return {
            ...edge,
            ...edgeProps,
            style: {
                ...edge?.style, //
                ...edgeProps__style,
            },
        };
    });
};

export const getArchitectureCanvasEdgeProps = ({
    selectedCanvasViewOnly, //
    // selectedPath,
    // viewAllPaths,
    edge,
    // canvas,
}: EdgeVisibilityFuncProps) => {
    if (
        edge?.data?.type === CanvasNodeType.architecture.toString() //
    ) {
        return {
            animated: false,
            //
            deletable: !selectedCanvasViewOnly,
            focusable: !selectedCanvasViewOnly,
            reconnectable: !selectedCanvasViewOnly,
            selectable: !selectedCanvasViewOnly,
            //
            zIndex: DEFAULT_ZINDEX_EDGE + 1,
            style: {
                opacity: SELECTED_NODE_EDGE_OPACITY, //
            },
        };
    }
    return {
        animated: false,
        selected: false,
        //
        deletable: false,
        focusable: false,
        reconnectable: false,
        selectable: false,
        //
        zIndex: DEFAULT_ZINDEX_EDGE,
        style: {
            opacity: DESELECTED_EDGE_OPACITY, //
        },
    };
};

export const getDataFlowCanvasEdgeProps = ({
    selectedCanvasViewOnly, //
    // selectedPath,
    // viewAllPaths,
    edge,
    // canvas,
}: EdgeVisibilityFuncProps) => {
    if (
        edge?.data?.type === CanvasNodeType.architecture.toString() //
    ) {
        return {
            animated: false,
            //
            deletable: false,
            focusable: false,
            reconnectable: false,
            selectable: false,
            //
            zIndex: DEFAULT_ZINDEX_EDGE + 1,
            style: {
                opacity: DESELECTED_EDGE_OPACITY, //
            },
        };
    } else if (
        edge?.data?.type === CanvasNodeType.data_flow.toString() //
    ) {
        return {
            animated: false,
            //
            deletable: !selectedCanvasViewOnly,
            focusable: !selectedCanvasViewOnly,
            reconnectable: !selectedCanvasViewOnly,
            selectable: !selectedCanvasViewOnly,
            //
            zIndex: DEFAULT_ZINDEX_EDGE + 1,
            style: {
                opacity: SELECTED_NODE_EDGE_OPACITY, //
            },
        };
    }
    return {
        animated: false,
        selected: false,
        //
        deletable: false,
        focusable: false,
        reconnectable: false,
        selectable: false,
        //
        zIndex: DEFAULT_ZINDEX_EDGE,
        style: {
            opacity: DESELECTED_EDGE_OPACITY, //
        },
    };
};

export const getSummaryCanvasEdgeProps = (_props: EdgeVisibilityFuncProps) => {
    return {
        animated: false,
        selected: false,
        //
        deletable: false,
        focusable: false,
        reconnectable: false,
        selectable: false,
        //
        zIndex: DEFAULT_ZINDEX_EDGE,
        style: {
            opacity: SELECTED_NODE_EDGE_OPACITY, //
        },
    };
};

export const getThreatScenarioCanvasEdgeProps = ({
    canvas,
    selectedPath,
    viewAllPaths,
    edge,
}: EdgeVisibilityFuncProps) => {
    const allPathEdgeIds = !!viewAllPaths ? getAllPathEdgeIds(canvas) : [];
    const comparableEdgeId = getComparableEdgeId(edge);
    const isSelectedPathEdge = !!selectedPath?.edges?.includes(comparableEdgeId);
    const isViewAllPathEdge = !!allPathEdgeIds.includes(comparableEdgeId);
    const isActiveThreatScenarioEdge = !!viewAllPaths ? isViewAllPathEdge : isSelectedPathEdge;

    const baseProps = {
        animated: false,
        selected: false,
        //
        deletable: false,
        focusable: false,
        reconnectable: false,
        selectable: false,
    };

    if (isActiveThreatScenarioEdge) {
        return {
            ...baseProps,
            zIndex:
                edge?.data?.type === CanvasEdgeType.threat_scenario.toString()
                    ? DEFAULT_ZINDEX_EDGE
                    : DEFAULT_ZINDEX_EDGE + 1,
            style: {
                opacity: SELECTED_NODE_EDGE_OPACITY, //
            },
        };
    }

    return {
        ...baseProps,
        zIndex:
            edge?.data?.type === CanvasNodeType.architecture.toString()
                ? DEFAULT_ZINDEX_EDGE + 1
                : DEFAULT_ZINDEX_EDGE,
        style: {
            opacity: DESELECTED_EDGE_OPACITY, //
        },
    };
};

export const getLLMCanvasEdgeProps = ({ selectedPath, edge }: EdgeVisibilityFuncProps) => {
    const comparableEdgeId = getComparableEdgeId(edge);
    const isSelectedPathEdge = !!selectedPath?.edges?.includes(comparableEdgeId);

    const baseProps = {
        animated: false,
        selected: false,
        //
        deletable: false,
        focusable: false,
        reconnectable: false,
        selectable: false,
    };

    if (isSelectedPathEdge) {
        return {
            ...baseProps,
            zIndex:
                edge?.data?.type === CanvasEdgeType.llm.toString()
                    ? DEFAULT_ZINDEX_EDGE
                    : DEFAULT_ZINDEX_EDGE + 1,
            style: {
                opacity: SELECTED_NODE_EDGE_OPACITY, //
            },
        };
    }

    return {
        ...baseProps,
        zIndex:
            edge?.data?.type === CanvasNodeType.architecture.toString()
                ? DEFAULT_ZINDEX_EDGE + 1
                : DEFAULT_ZINDEX_EDGE,
        style: {
            opacity: DESELECTED_EDGE_OPACITY, //
        },
    };
};

export const evalGetEdgePropsFunc = (
    canvas_type?: string //
) => {
    switch (canvas_type) {
        case CanvasType.architecture:
            return getArchitectureCanvasEdgeProps;
        case CanvasType.data_flow:
            return getDataFlowCanvasEdgeProps;
        case CanvasType.summary:
            return getSummaryCanvasEdgeProps;
        case CanvasType.threat_scenario:
            return getThreatScenarioCanvasEdgeProps;
        case CanvasType.llm:
            return getLLMCanvasEdgeProps;
        default:
            return () => {
                return {};
            };
    }
};

export const getProcessedEdges = ({
    projectDiagram__isAuthorized,
    projectDiagram,
    canvasEdges,
    selectedCanvas,
    selectedCanvasViewOnly,
    //
    filterAuthorizedEdges,
    filterSelectedViewEdges,
    selectedPath,
    viewAllPaths,
    threatOverviewScenarioScope: _threatOverviewScenarioScope,
    visibleThreatScenarioCanvasIds: _visibleThreatScenarioCanvasIds,
}: {
    projectDiagram__isAuthorized: IsAuthorized;
    projectDiagram: ProjectDiagram;
    canvasEdges: DiagramEdge[];
    selectedCanvas: DiagramCanvas;
    selectedCanvasViewOnly: boolean | undefined;
    //
    architectureEdges?: DiagramEdge[];
    filterAuthorizedEdges?: boolean;
    filterSelectedViewEdges?: boolean;
    selectedPath?: AttackPath | undefined;
    viewAllPaths?: boolean;
    threatOverviewScenarioScope?: "top5" | "all";
    visibleThreatScenarioCanvasIds?: string[];
}) => {
    const getEdgePropsFunc = evalGetEdgePropsFunc(
        selectedCanvas.canvas_type //
    );

    let processed_edges = [
        ...canvasEdges, //
    ] as DiagramEdge[];

    const nodesById = new Map(selectedCanvas.nodes.map((n) => [n.id, n]));
    processed_edges = processed_edges.filter((edge) => {
        const sourceNode = nodesById.get(edge.source);
        const targetNode = nodesById.get(edge.target);
        const isDirectContainmentEdge =
            targetNode?.parentId === edge.source || sourceNode?.parentId === edge.target;
        return !isDirectContainmentEdge;
    });

    // Temporarily keep non-canvas edges out of the primary canvas state.
    // if (selectedCanvas.canvas_type !== CanvasType.architecture) {
    //     processed_edges = [
    //         ...architectureEdges, //
    //         ...processed_edges,
    //     ];
    // }
    const visibilityCanvas = projectDiagram.canvas;

    if (!!filterSelectedViewEdges) {
        processed_edges = getSelectedViewEdges(
            processed_edges, //
            visibilityCanvas,
            getEdgePropsFunc,
            selectedCanvas,
            selectedCanvasViewOnly,
            selectedPath,
            viewAllPaths
        );
    }
    if (!!filterAuthorizedEdges) {
        processed_edges = getAuthorizedEdges(
            processed_edges, //
            projectDiagram__isAuthorized
        );
    }
    return processed_edges;
};

export const checkIfEdgeCanBeDeleted = ({
    edge,
    selectedCanvasType,
    allowDeleteEdgeInAnyCanvas = false,
}: {
    edge: DiagramEdge; //
    selectedCanvasType?: DiagramCanvas["canvas_type"] | undefined;
    allowDeleteEdgeInAnyCanvas?: boolean;
}) => {
    const edge_deletable = edge?.deletable ?? true;
    if (!edge_deletable) {
        throw new Error("This edge cannot be deleted.");
    }

    if (edge?.data?.type !== selectedCanvasType && !allowDeleteEdgeInAnyCanvas) {
        throw new Error("This edge can only be modified in its original canvas.");
    }
    return true;
};

export const getHandlePosition = (
    edgeIdsInOrder: string[],
    currentEdge: Edge,
    handleType: string,
    x: number,
    y: number
) => {
    const uniqueEdgeIds = Array.from(new Set(edgeIdsInOrder));
    const numberOfEdges = uniqueEdgeIds.length;

    // Keep a lone edge centered on the handle.
    if (numberOfEdges <= 1) {
        return {
            staggeredX: x,
            staggeredY: y,
        };
    }

    // Spread multiple edges symmetrically around the handle center.
    const currentEdgeIndex = Math.max(uniqueEdgeIds.indexOf(currentEdge.id), 0);
    const centeredOffset = -0.5 * (numberOfEdges - 1) * STAGGER_SPACING;

    let staggeredX = x;
    let staggeredY = y;
    switch (handleType) {
        case EdgeHandleType.attack_source_top:
        case EdgeHandleType.attack_target_top:
        case EdgeHandleType.source_top:
        case EdgeHandleType.target_top:
            staggeredX = x + centeredOffset + currentEdgeIndex * STAGGER_SPACING;
            staggeredY = y - DEFAULT_EDGE_HANDLE_ORTHO_OFFSET;
            break;
        case EdgeHandleType.attack_source_left:
        case EdgeHandleType.attack_target_left:
        case EdgeHandleType.source_left:
        case EdgeHandleType.target_left:
            staggeredY = y + centeredOffset + currentEdgeIndex * STAGGER_SPACING;
            staggeredX = x - DEFAULT_EDGE_HANDLE_ORTHO_OFFSET;
            break;
        case EdgeHandleType.attack_source_bottom:
        case EdgeHandleType.attack_target_bottom:
        case EdgeHandleType.source_bottom:
        case EdgeHandleType.target_bottom:
            staggeredX = x + centeredOffset + currentEdgeIndex * STAGGER_SPACING;
            staggeredY = y + DEFAULT_EDGE_HANDLE_ORTHO_OFFSET;
            break;
        case EdgeHandleType.attack_source_right:
        case EdgeHandleType.attack_target_right:
        case EdgeHandleType.source_right:
        case EdgeHandleType.target_right:
            staggeredY = y + centeredOffset + currentEdgeIndex * STAGGER_SPACING;
            staggeredX = x + DEFAULT_EDGE_HANDLE_ORTHO_OFFSET;
            break;
        default:
            staggeredX = x;
            staggeredY = y;
            break;
    }

    return { staggeredX, staggeredY };
};

export const getInitFirstSplineVector = ({
    source,
    sourcePosition = Position.Bottom,
    target,
}: {
    source: XYPosition;
    sourcePosition: Position;
    target: XYPosition;
}): XYPosition => {
    if (
        !![
            Position.Left, //
            Position.Right,
        ]?.includes(sourcePosition)
    ) {
        return source.x < target.x //
            ? { x: 1, y: 0 }
            : { x: -1, y: 0 };
    }
    return source.y < target.y //
        ? { x: 0, y: 1 }
        : { x: 0, y: -1 };
};

const handleDirections = {
    [Position.Left]: { x: -1, y: 0 },
    [Position.Right]: { x: 1, y: 0 },
    [Position.Top]: { x: 0, y: -1 },
    [Position.Bottom]: { x: 0, y: 1 },
};

// Mimic a orthogonal edge routing behaviour
// Not as good as a real orthogonal edge routing but it's faster and good enough as a default for
// step and smooth step edges
export const getPoints = ({
    source,
    sourcePosition = Position.Bottom,
    target,
    targetPosition = Position.Top,
    center,
}: {
    source: XYPosition;
    sourcePosition: Position;
    target: XYPosition;
    targetPosition: Position;
    center: Partial<XYPosition>;
}): [XYPosition[], number, number, number, number] => {
    const sourceDir = handleDirections[sourcePosition];
    const targetDir = handleDirections[targetPosition];

    // first & last points
    const sourceGapped: XYPosition = {
        x: source.x + sourceDir.x,
        y: source.y + sourceDir.y,
    };
    const targetGapped: XYPosition = {
        x: target.x + targetDir.x,
        y: target.y + targetDir.y,
    };

    let points: XYPosition[] = [];
    let centerX, centerY;

    const getGapOffset = (position: Position) => {
        switch (position) {
            case Position.Top:
                return { x: 0, y: -1 * DEFAULT_GAP_OFFSET };
            case Position.Bottom:
                return { x: 0, y: DEFAULT_GAP_OFFSET };
            case Position.Left:
                return { x: -1 * DEFAULT_GAP_OFFSET, y: 0 };
            case Position.Right:
                return { x: DEFAULT_GAP_OFFSET, y: 0 };
        }
        return { x: 0, y: 0 };
    };
    const sourceGapOffset = getGapOffset(sourcePosition);
    const targetGapOffset = getGapOffset(targetPosition);

    // 2nd & 2nd last points
    const sourceGappedExtended: XYPosition = {
        x: sourceGapped.x + sourceGapOffset.x,
        y: sourceGapped.y + sourceGapOffset.y,
    };
    const targetGappedExtended: XYPosition = {
        x: targetGapped.x + targetGapOffset.x,
        y: targetGapped.y + targetGapOffset.y,
    };

    const initSplineVector = getInitFirstSplineVector({
        source: sourceGappedExtended,
        sourcePosition,
        target: targetGappedExtended,
    });
    const initSplineAxis =
        initSplineVector.x !== 0
            ? "x" // source position is left or right
            : "y"; // source position is top or bottom
    const currDir = initSplineVector[initSplineAxis];

    const {
        centerX: defaultCenterX, //
        centerY: defaultCenterY,
        xOffset: defaultOffsetX,
        yOffset: defaultOffsetY,
    } = getEdgeCenter({
        sourceX: source.x,
        sourceY: source.y,
        targetX: target.x,
        targetY: target.y,
    });

    // opposite handle positions, default case
    if (sourceDir[initSplineAxis] * targetDir[initSplineAxis] === -1) {
        centerX = center.x ?? defaultCenterX;
        centerY = center.y ?? defaultCenterY;
        //    --->
        //    |
        // >---
        const verticalSplit: XYPosition[] = [
            { x: centerX, y: sourceGappedExtended.y },
            { x: centerX, y: targetGappedExtended.y },
        ];
        //    |
        //  ---
        //  |
        const horizontalSplit: XYPosition[] = [
            { x: sourceGappedExtended.x, y: centerY },
            { x: targetGappedExtended.x, y: centerY },
        ];

        if (sourceDir[initSplineAxis] === currDir)
            points = initSplineAxis === "x" ? verticalSplit : horizontalSplit;
        else points = initSplineAxis === "x" ? horizontalSplit : verticalSplit;
    } else {
        const sourceTarget: XYPosition[] = [
            {
                x: sourceGappedExtended.x, //
                y: targetGappedExtended.y,
            },
        ];
        const targetSource: XYPosition[] = [
            {
                x: targetGappedExtended.x, //
                y: sourceGappedExtended.y,
            },
        ];
        // this handles edges with same handle positions
        if (initSplineAxis === "x") points = sourceDir.x === currDir ? targetSource : sourceTarget;
        else points = sourceDir.y === currDir ? sourceTarget : targetSource;

        if (sourcePosition !== targetPosition) {
            // For handling mixed handle positions like Right -> Bottom
            const dirAccessorOpposite = initSplineAxis === "x" ? "y" : "x";
            const isSameDir = sourceDir[initSplineAxis] === targetDir[dirAccessorOpposite];
            const sourceGtTargetOppo =
                sourceGapped[dirAccessorOpposite] > targetGapped[dirAccessorOpposite];
            const sourceLtTargetOppo =
                sourceGapped[dirAccessorOpposite] < targetGapped[dirAccessorOpposite];
            const flipSourceTarget =
                (sourceDir[initSplineAxis] === 1 &&
                    ((!isSameDir && sourceGtTargetOppo) || (isSameDir && sourceLtTargetOppo))) ||
                (sourceDir[initSplineAxis] !== 1 &&
                    ((!isSameDir && sourceLtTargetOppo) || (isSameDir && sourceGtTargetOppo)));

            if (flipSourceTarget) {
                points = initSplineAxis === "x" ? sourceTarget : targetSource;
            }
        }

        const maxXDistance = Math.max(
            Math.abs(sourceGappedExtended.x - (points[0]?.x || 0)),
            Math.abs(targetGappedExtended.x - (points[0]?.x || 0))
        );
        const maxYDistance = Math.max(
            Math.abs(sourceGappedExtended.y - (points[0]?.y || 0)),
            Math.abs(targetGappedExtended.y - (points[0]?.y || 0))
        );

        // we want to place the label on the longest segment of the edge
        if (maxXDistance >= maxYDistance) {
            centerX = (sourceGappedExtended.x + targetGappedExtended.x) / 2;
            centerY = points[0]?.y || 0;
        } else {
            centerX = points[0]?.x || 0;
            centerY = (sourceGappedExtended.y + targetGappedExtended.y) / 2;
        }
    }

    const pathPoints = [source, sourceGappedExtended, ...points, targetGappedExtended, target];
    return [pathPoints, centerX, centerY, defaultOffsetX, defaultOffsetY];
};

export const getEdgeCenter = ({
    sourceX, //
    sourceY,
    targetX,
    targetY,
}: {
    sourceX: number;
    sourceY: number;
    targetX: number;
    targetY: number;
}) => {
    const xOffset = Math.abs(targetX - sourceX) / 2;
    const centerX = targetX < sourceX ? targetX + xOffset : targetX - xOffset;

    const yOffset = Math.abs(targetY - sourceY) / 2;
    const centerY = targetY < sourceY ? targetY + yOffset : targetY - yOffset;

    return { centerX, centerY, xOffset, yOffset };
};

export const computeCurrentPoint = ({
    currentEdge,
    edgeProps,
    nodeHandleEdgeMapping,
}: {
    currentEdge: Edge;
    edgeProps: Partial<EdgeProps>;
    nodeHandleEdgeMapping: NodeHandleEdgeMappingDict;
}) => {
    const overlappingEdgeIdsAtSource =
        nodeHandleEdgeMapping?.[currentEdge.source]?.handles?.[currentEdge.sourceHandle || ""] ||
        [];
    const overlappingEdgeIdsAtTarget =
        nodeHandleEdgeMapping?.[currentEdge.target]?.handles?.[currentEdge.targetHandle || ""] ||
        [];

    // calculate staggered handle positions
    const {
        staggeredX: staggeredTargetX, //
        staggeredY: staggeredTargetY,
    } = getHandlePosition(
        overlappingEdgeIdsAtTarget,
        currentEdge,
        `${currentEdge.targetHandle}`,
        edgeProps.targetX ?? 0,
        edgeProps.targetY ?? 0
    );
    const {
        staggeredX: staggeredSourceX, //
        staggeredY: staggeredSourceY,
    } = getHandlePosition(
        overlappingEdgeIdsAtSource,
        currentEdge,
        `${currentEdge.sourceHandle}`,
        edgeProps.sourceX ?? 0,
        edgeProps.sourceY ?? 0
    );

    // calculate currentPoints for segmentedPath
    const { centerX, centerY } = getEdgeCenter({
        sourceX: staggeredSourceX,
        sourceY: staggeredSourceY,
        targetX: staggeredTargetX,
        targetY: staggeredTargetY,
    });

    const source = { x: staggeredSourceX, y: staggeredSourceY };
    const target = { x: staggeredTargetX, y: staggeredTargetY };

    return getPoints({
        source,
        target,
        center: { x: centerX, y: centerY },
        sourcePosition: getPositionFromHandleId(edgeProps?.sourceHandleId || ""),
        targetPosition: getPositionFromHandleId(edgeProps?.targetHandleId || ""),
    });
};

export const getBaseEdgeProps = (
    edgeProps: EdgeProps //
) => {
    const {
        animated, //
        selectable,
        deletable,
        sourceX,
        sourceY,
        targetX,
        targetY,
        sourcePosition,
        targetPosition,
        sourceHandleId,
        targetHandleId,
        pathOptions,
        id,
        ...baseEdgeProps
    } = edgeProps;

    return {
        baseEdgeProps,
        id,
        animated, //
        selectable,
        deletable,
        sourceX,
        sourceY,
        targetX,
        targetY,
        sourcePosition,
        targetPosition,
        sourceHandleId,
        targetHandleId,
        pathOptions,
    };
};

export const getPathHandlePosition = (handleId: string) => {
    if (handleId.includes("right")) return Position.Right;
    if (handleId.includes("left")) return Position.Left;
    if (handleId.includes("top")) return Position.Top;
    if (handleId.includes("bottom")) return Position.Bottom;
    return Position.Right;
};

export const getAnchorPointFromNode = ({
    node,
    handlePosition,
    allNodes,
}: {
    node: DiagramNode;
    handlePosition: Position;
    allNodes: DiagramNode[];
}) => {
    const absolutePosition = getNodePositionAbsolute({
        node,
        allNodes,
    });
    const width = Number(node.width ?? node.style?.width ?? node.measured?.width ?? 0) || 80;
    const height = Number(node.height ?? node.style?.height ?? node.measured?.height ?? 0) || 80;

    switch (handlePosition) {
        case Position.Left:
            return {
                x: absolutePosition.x,
                y: absolutePosition.y + height / 2,
            };
        case Position.Top:
            return {
                x: absolutePosition.x + width / 2,
                y: absolutePosition.y,
            };
        case Position.Bottom:
            return {
                x: absolutePosition.x + width / 2,
                y: absolutePosition.y + height,
            };
        case Position.Right:
        default:
            return {
                x: absolutePosition.x + width,
                y: absolutePosition.y + height / 2,
            };
    }
};

export const getAttackPathEdge = ({
    edgeId,
    sourceHandleId,
    sourceX,
    sourceY,
    targetHandleId,
    targetX,
    targetY,
    nodeHandleEdgeMapping,
    allEdges,
}: {
    edgeId: string;
    sourceHandleId?: string | null;
    sourceX: number;
    sourceY: number;
    targetHandleId?: string | null;
    targetX: number;
    targetY: number;
    nodeHandleEdgeMapping: NodeHandleEdgeMappingDict;
    allEdges: Edge[];
}) => {
    const currentEdge = allEdges.find((edge) => edge.id === edgeId);
    if (!currentEdge) {
        return "";
    }

    const sourcePosition = getPathHandlePosition(sourceHandleId || "");
    const targetPosition = getPathHandlePosition(targetHandleId || "");

    const [currentPoints] = computeCurrentPoint({
        currentEdge,
        edgeProps: {
            sourceHandleId: sourceHandleId || null,
            sourceX,
            sourceY,
            targetHandleId: targetHandleId || null,
            targetX,
            targetY,
        },
        nodeHandleEdgeMapping,
    });

    const [edgePath] = getSmoothStepPath({
        sourceX: currentPoints?.[0]?.x || 0,
        sourceY: currentPoints?.[0]?.y || 0,
        targetX: currentPoints?.[currentPoints.length - 1]?.x || 0,
        targetY: currentPoints?.[currentPoints.length - 1]?.y || 0,
        sourcePosition,
        targetPosition,
    });

    return edgePath;
};

export const getFallbackAttackPathEdge = ({
    edgeProps,
    allNodes,
}: {
    edgeProps: EdgeProps;
    allNodes: DiagramNode[];
}) => {
    const resolvedSourcePosition =
        edgeProps.sourcePosition ?? getPathHandlePosition(edgeProps.sourceHandleId || "");
    const resolvedTargetPosition =
        edgeProps.targetPosition ?? getPathHandlePosition(edgeProps.targetHandleId || "");
    const sourceNode = allNodes.find((node) => node.id === edgeProps.source);
    const targetNode = allNodes.find((node) => node.id === edgeProps.target);

    if (sourceNode && targetNode) {
        const manualSourcePoint = getAnchorPointFromNode({
            node: sourceNode,
            handlePosition: resolvedSourcePosition,
            allNodes,
        });
        const manualTargetPoint = getAnchorPointFromNode({
            node: targetNode,
            handlePosition: resolvedTargetPosition,
            allNodes,
        });

        const [fallbackEdgePath] = getSmoothStepPath({
            sourceX: manualSourcePoint.x,
            sourceY: manualSourcePoint.y,
            targetX: manualTargetPoint.x,
            targetY: manualTargetPoint.y,
            sourcePosition: resolvedSourcePosition,
            targetPosition: resolvedTargetPosition,
        });

        return fallbackEdgePath;
    }

    const [fallbackEdgePath] = getSmoothStepPath({
        sourceX: edgeProps.sourceX,
        sourceY: edgeProps.sourceY,
        targetX: edgeProps.targetX,
        targetY: edgeProps.targetY,
        sourcePosition: resolvedSourcePosition,
        targetPosition: resolvedTargetPosition,
    });

    return fallbackEdgePath;
};

export const checkIfEdgeSelectedByDialog = ({
    targetEdgeId,
    edgeId,
    originalEdgeId,
}: {
    targetEdgeId: string;
    edgeId: string;
    originalEdgeId?: string;
}) => {
    const comparableEdgeId = String(originalEdgeId || edgeId || "");
    return targetEdgeId === edgeId || targetEdgeId === comparableEdgeId;
};

// For staggering edges
export const getOverlappingEdgesInOrder = ({
    allNodes,
    edges,
    refNodehandle,
    refNodeId,
}: {
    allNodes: DiagramNode[];
    edges: DiagramEdge[];
    refNodehandle: string;
    refNodeId: string;
}) => {
    // get array of edges that overlap with the currentEdge's source/target handle
    const refNodehandlePosition = getPositionFromHandleId(refNodehandle);
    const matchedEdgesAsTarget = edges.filter(
        (e) =>
            getPositionFromHandleId(e.targetHandle ?? "") === refNodehandlePosition &&
            e.target === refNodeId
    );
    const matchedNodeIdsWithSameTargetHandle = matchedEdgesAsTarget.flatMap((edge) => {
        const node = allNodes.find((n) => n.id === edge.source);
        if (!node) return [];
        return [
            {
                edge, //
                node,
            },
        ];
    });
    const matchedEdgesAsSource = edges.filter(
        (e) =>
            getPositionFromHandleId(e.sourceHandle ?? "") === refNodehandlePosition &&
            e.source === refNodeId
    );
    const matchedNodeIdsWithSameSourceHandle = matchedEdgesAsSource.flatMap((edge) => {
        const node = allNodes.find((n) => n.id === edge.target);
        if (!node) return [];
        return [
            {
                edge, //
                node,
            },
        ];
    });
    const matchedEdgesAndAssociatedNodes = [
        ...matchedNodeIdsWithSameTargetHandle,
        ...matchedNodeIdsWithSameSourceHandle,
    ];

    if (refNodehandlePosition === Position.Bottom || refNodehandlePosition === Position.Top) {
        matchedEdgesAndAssociatedNodes.sort((a, b) => {
            const positionAbsolute_a = getNodePositionAbsolute({
                node: a.node,
                allNodes,
            });
            const positionAbsolute_b = getNodePositionAbsolute({
                node: b.node,
                allNodes,
            });
            if (positionAbsolute_a.x === positionAbsolute_b.x) {
                return positionAbsolute_a.y - positionAbsolute_b.y;
            }
            return positionAbsolute_a.x - positionAbsolute_b.x;
        });
    } else if (
        refNodehandlePosition === Position.Left ||
        refNodehandlePosition === Position.Right
    ) {
        matchedEdgesAndAssociatedNodes.sort((a, b) => {
            const positionAbsolute_a = getNodePositionAbsolute({
                node: a.node, //
                allNodes,
            });
            const positionAbsolute_b = getNodePositionAbsolute({
                node: b.node, //
                allNodes,
            });
            if (positionAbsolute_a.y === positionAbsolute_b.y) {
                return positionAbsolute_a.x - positionAbsolute_b.x;
            }
            return positionAbsolute_a.y - positionAbsolute_b.y;
        });
    }

    const matchedEdges = matchedEdgesAndAssociatedNodes.map((mapping) => {
        return mapping.edge;
    });
    return matchedEdges;
};

export const getInitializedDiagramEdge = (edge: DiagramEdge) => {
    const edge_type = edge?.data?.type || "custom";
    const type_color = CanvasEdgeColor[edge_type as CanvasEdgeType];
    const isBidirectional = !!edge?.data?.["bidirectional"];
    const normalizedStyle = {
        ...default_edge?.style,
        ...(type_color ? { stroke: type_color } : {}),
        ...(edge?.style ?? {}),
    };
    const lineStrokeColor = String(normalizedStyle.stroke ?? default_marker_props.color);
    const defaultMarkerWithoutColor = default_edge?.markerEnd
        ? (() => {
              const { color: color, ...markerWithoutColor } = default_edge.markerEnd as EdgeMarker;
              void color;
              return markerWithoutColor;
          })()
        : undefined;
    const getNormalizedMarker = (
        marker: DiagramEdge["markerEnd"] | DiagramEdge["markerStart"] | undefined,
        fallbackColor?: string
    ) => {
        if (!marker) {
            return undefined;
        }

        if (typeof marker === "string") {
            return marker;
        }

        return {
            ...(marker as EdgeMarker),
            type: marker.type ?? default_marker_props.type,
            color: marker.color ?? fallbackColor ?? default_marker_props.color,
        };
    };
    const _edge = {
        id: edge?.id ?? default_edge?.id, //
        animated: edge?.animated ?? default_edge?.animated,
        className: edge?.className ?? default_edge?.className,
        data: edge?.data ?? default_edge?.data,
        deletable: edge?.deletable ?? default_edge?.deletable,
        hidden: edge?.hidden ?? default_edge?.hidden,
        interactionWidth: edge?.interactionWidth ?? default_edge?.interactionWidth,
        label: edge?.label ?? default_edge?.label,
        labelBgPadding: edge?.labelBgPadding ?? default_edge?.labelBgPadding,
        markerEnd:
            getNormalizedMarker(edge?.markerEnd, lineStrokeColor) ??
            getNormalizedMarker(defaultMarkerWithoutColor, lineStrokeColor),
        source: edge?.source ?? default_edge?.source,
        sourceHandle: edge?.sourceHandle ?? default_edge?.sourceHandle,
        style: normalizedStyle,
        target: edge?.target ?? default_edge?.target,
        targetHandle: edge?.targetHandle ?? default_edge?.targetHandle,
        type: edge?.type ?? default_edge?.type,
        zIndex: edge?.zIndex ?? default_edge?.zIndex,
        ...(isBidirectional
            ? {
                  markerStart:
                      getNormalizedMarker(edge?.markerStart, lineStrokeColor) ??
                      getNormalizedMarker(defaultMarkerWithoutColor, lineStrokeColor),
              }
            : {}),
    };
    return _edge as DiagramEdge;
};

export const getInitializedDiagramEdges = (edges: DiagramEdge[]) => {
    return edges?.map((edge) => getInitializedDiagramEdge(edge)) || [];
};
