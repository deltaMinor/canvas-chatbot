import { Position, XYPosition } from "@xyflow/react";

import {
    DiagramEdge,
    DiagramNode,
    DragHandleType,
    LineSegment,
    NodeHandleEdgeMappingDict,
} from "#root/interfaces/diagram";
import { UuidIdentifierKey } from "#root/interfaces/identifier";
import { computeCurrentPoint } from "#root/utils/diagram/diagramEdgeUtil";
import { getNodePositionAbsolute } from "#root/utils/diagram/diagramNodePositionUtil";
import { getPositionFromHandleId } from "#root/utils/diagram/diagramNodeUtil";
import { generateUUID } from "#root/utils/identifierUtil";

/**
 * Resolver class for computing and managing line segments in diagram edges.
 * Handles the conversion of diagram edges into discrete line segments with
 * direction information, positions, and handle offsets.
 */
export class LineSegmentResolver {
    allNodes: DiagramNode[];
    nodeHandleEdgeMapping: NodeHandleEdgeMappingDict;

    /**
     * Creates an instance of LineSegmentResolver.
     *
     * @param allNodes - Array of all diagram nodes in the diagram.
     * @param nodeHandleEdgeMapping - Mapping between node ids, handles, and edges.
     */
    constructor(
        allNodes: DiagramNode[], //
        nodeHandleEdgeMapping: NodeHandleEdgeMappingDict
    ) {
        this.allNodes = allNodes;
        this.nodeHandleEdgeMapping = nodeHandleEdgeMapping;
    }

    /**
     * Computes line segments for a given diagram edge.
     * Calculates the source and target positions, computes current points,
     * and converts them into discrete line segments.
     *
     * @param edge - The diagram edge to compute line segments for.
     * @returns Array of line segments representing the edge.
     * @throws {Error} Throws an error if source or target node is not found.
     */
    computeLineSegments({
        edge, //
    }: {
        edge: DiagramEdge;
    }) {
        const sourceHandlePosition = getPositionFromHandleId(edge?.sourceHandle || "");
        const targetHandlePosition = getPositionFromHandleId(edge?.targetHandle || "");

        const nodeAtEdgeSource = this.allNodes.find((n) => n.id === edge?.source);
        const nodeAtEdgeTarget = this.allNodes.find((n) => n.id === edge?.target);
        if (!nodeAtEdgeSource || !nodeAtEdgeTarget) {
            throw new Error("Node not found.");
        }

        const [sourceX, sourceY] = this.computeXYPosition({
            handlePosition: sourceHandlePosition,
            node: nodeAtEdgeSource,
        });
        const [targetX, targetY] = this.computeXYPosition({
            handlePosition: targetHandlePosition,
            node: nodeAtEdgeTarget,
        });
        const [currentPoints] = computeCurrentPoint({
            currentEdge: edge,
            edgeProps: {
                sourceHandleId: sourceHandlePosition,
                targetHandleId: targetHandlePosition,
                sourceX: sourceX || 0,
                sourceY: sourceY || 0,
                targetX: targetX || 0,
                targetY: targetY || 0,
            },
            nodeHandleEdgeMapping: this.nodeHandleEdgeMapping,
        });
        return this.getLineSegments(currentPoints, []);
    }

    /**
     * Computes the absolute X and Y coordinates for a handle position on a node.
     * Takes into account the node's absolute position, dimensions, and applies
     * a handle diameter offset based on the handle's position (Top, Bottom, Left, Right).
     *
     * @param handlePosition - The position of the handle on the node (Top, Bottom, Left, Right).
     * @param node - The diagram node containing the handle.
     * @returns A tuple [x, y] representing the absolute coordinates of the handle.
     */
    computeXYPosition({ handlePosition, node }: { handlePosition: Position; node: DiagramNode }) {
        const positionAbsolute = getNodePositionAbsolute({
            allNodes: this.allNodes,
            node, //
        });
        let x = positionAbsolute.x;
        let y = positionAbsolute.y;
        const node_width = Number(node?.style?.width ?? 0);
        const node_height = Number(node?.style?.height ?? 0);
        const HANDLE_DIAMETER_OFFSET = 20;
        switch (handlePosition) {
            case Position.Top:
                x += node_width / 2;
                y -= HANDLE_DIAMETER_OFFSET;
                break;
            case Position.Bottom:
                x += node_width / 2;
                y += node_height + HANDLE_DIAMETER_OFFSET;
                break;
            case Position.Right:
                x += node_width + HANDLE_DIAMETER_OFFSET;
                y += node_height / 2;
                break;
            case Position.Left:
                x -= HANDLE_DIAMETER_OFFSET;
                y += node_height / 2;
                break;
        }
        return [x, y];
    }

    /**
     * Converts an array of points into line segments, filtering out unnecessary segments.
     * Skips segments where consecutive points have the same direction (to avoid redundant segments).
     * Only creates segments at points where the direction changes or at inflection points.
     * If lineSegments are already provided, returns them as-is.
     *
     * @param points - Array of XY positions representing the edge path.
     * @param lineSegments - Optional pre-existing line segments. If provided and non-empty, returns them unchanged.
     * @returns Array of line segments with direction, length, start/end positions, and generated IDs.
     */
    getLineSegments(
        points: XYPosition[], //
        lineSegments: LineSegment[] = []
    ): LineSegment[] {
        if (!lineSegments.length) {
            const _lineSegments: LineSegment[] = [];

            points.forEach((_, idx) => {
                if (idx < 1 || idx >= points.length - 2) return _;
                if (
                    idx < points.length - 2 &&
                    this.getLineDirection(
                        points[idx] || { x: 0, y: 0 },
                        points[idx + 1] || { x: 0, y: 0 }
                    ) ===
                        this.getLineDirection(
                            points[idx + 1] || { x: 0, y: 0 },
                            points[idx + 2] || { x: 0, y: 0 }
                        )
                )
                    return _;
                if (
                    idx >= 1 &&
                    this.getLineDirection(
                        points[idx - 1] || { x: 0, y: 0 },
                        points[idx] || { x: 0, y: 0 }
                    ) ===
                        this.getLineDirection(
                            points[idx] || { x: 0, y: 0 },
                            points[idx + 1] || { x: 0, y: 0 }
                        )
                )
                    return _;
                const _lineSegment = {
                    lineStart: points[idx] || { x: 0, y: 0 },
                    lineEnd: points[idx + 1] || { x: 0, y: 0 },
                    lineLength: Math.abs(
                        this.getCoordinate(
                            points[idx + 1] || { x: 0, y: 0 },
                            this.getLineDirection(
                                points[idx] || { x: 0, y: 0 },
                                points[idx + 1] || { x: 0, y: 0 }
                            )
                        ) -
                            this.getCoordinate(
                                points[idx] || { x: 0, y: 0 },
                                this.getLineDirection(
                                    points[idx] || { x: 0, y: 0 },
                                    points[idx + 1] || { x: 0, y: 0 }
                                )
                            )
                    ),
                    handleOffset: 0,
                    snappedHandleOffset: 0,
                    direction: this.getLineDirection(
                        points[idx] || { x: 0, y: 0 },
                        points[idx + 1] || { x: 0, y: 0 }
                    ),
                    id: generateUUID(UuidIdentifierKey.diagramLineSegment),
                };

                _lineSegments.push(_lineSegment);
                return _;
            });
            return _lineSegments;
        } else {
            return lineSegments;
        }
    }

    /**
     * Determines the direction of a line segment based on two points.
     *
     * @param startPoint - The starting point of the line segment.
     * @param endPoint - The ending point of the line segment.
     * @returns DragHandleType.horizontal if the line is primarily horizontal (x difference > 0),
     *          DragHandleType.vertical if the line is primarily vertical.
     */
    getLineDirection(
        startPoint: XYPosition, //
        endPoint: XYPosition
    ): DragHandleType {
        if (Math.abs(startPoint.x - endPoint.x) > 0) {
            return DragHandleType.horizontal;
        } else {
            return DragHandleType.vertical;
        }
    }

    /**
     * Gets the coordinate value for a point based on the drag handle type.
     * Currently returns the Y coordinate regardless of handle type.
     *
     * @param point - The point to extract the coordinate from.
     * @param dragHandleType - The type of drag handle (vertical or horizontal).
     * @returns The Y coordinate of the point.
     */
    getCoordinate(
        point: XYPosition, //
        dragHandleType: string
    ): number {
        if (dragHandleType === DragHandleType.vertical) {
            return point.y;
        } else {
            return point.y;
        }
    }
}
