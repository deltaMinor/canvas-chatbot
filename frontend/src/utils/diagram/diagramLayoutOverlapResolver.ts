import { XYPosition, getSmoothStepPath } from "@xyflow/react";

import { CanvasNodeVariantType, DiagramEdge, DiagramNode } from "#root/interfaces/diagram";

import { getRealignedEdgeHandles } from "./diagramEdgeHandleRealignUtil";
import { getAnchorPointFromNode, getPathHandlePosition } from "./diagramEdgeUtil";
import { getNodeInfo } from "./diagramNodePositionUtil";
import { checkIfNodeCompletelyOutside, isChildNode } from "./diagramNodeUtil";

interface Box {
    x: number;
    y: number;
    width: number;
    height: number;
}

type NodeNodeViolation = {
    kind: "node-node";
    nodeAId: string;
    nodeBId: string;
};

type NodeEdgeViolation = {
    kind: "node-edge";
    nodeId: string;
    edgeId: string;
};

type Violation = NodeNodeViolation | NodeEdgeViolation;

interface MoverResolution {
    // id of the node whose `position` should actually be translated
    moverId: string;
    // id of the node whose absolute box the mover must stay fully inside
    // while searching (undefined = effectively unconstrained/top-level)
    containedWithinId?: string | undefined;
}

interface SearchResult {
    offset: XYPosition;
    nodes: DiagramNode[];
    edges: DiagramEdge[];
}

// Matches the handle "stub" length used when the real edges are rendered
const HANDLE_STUB_OFFSET = 20;

const SEARCH_GRID_STEP = 40;

const NODE_OVERLAP_MARGIN = 20;

const CLUSTER_FIT_MARGIN = 80;

// Safety valves to guarantee termination on pathological/import-corrupted
// diagrams instead of hanging the UI.
const MAX_RESOLUTION_ITERATIONS = 300;
const MAX_SEARCH_EXPANSIONS = 4000;
const UNBOUNDED_SEARCH_MARGIN = 4000;

const toBox = (node: DiagramNode, allNodes: DiagramNode[]): Box | undefined => {
    const info = getNodeInfo({ node, allNodes });
    if (!info) return undefined;
    return {
        x: info.nodeX_left,
        y: info.nodeY_top,
        width: info.nodeWidth,
        height: info.nodeHeight,
    };
};

const toNodeInfo = (box: Box) => ({
    nodeWidth: box.width,
    nodeHeight: box.height,
    nodeX_left: box.x,
    nodeX_right: box.x + box.width,
    nodeY_top: box.y,
    nodeY_bottom: box.y + box.height,
});

const inflateBox = (box: Box, margin: number): Box => ({
    x: box.x - margin,
    y: box.y - margin,
    width: box.width + margin * 2,
    height: box.height + margin * 2,
});

const boxesOverlap = (a: Box, b: Box): boolean => {
    const aInfo = toNodeInfo(inflateBox(a, NODE_OVERLAP_MARGIN));
    const bInfo = toNodeInfo(inflateBox(b, NODE_OVERLAP_MARGIN));
    return !checkIfNodeCompletelyOutside({ nodeA_info: aInfo, nodeB_info: bInfo });
};

const pointInBox = (p: XYPosition, box: Box): boolean => {
    return p.x >= box.x && p.x <= box.x + box.width && p.y >= box.y && p.y <= box.y + box.height;
};

// Standard orientation-based segment intersection test.
const orientation = (p: XYPosition, q: XYPosition, r: XYPosition): number => {
    const val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
    if (Math.abs(val) < 1e-9) return 0;
    return val > 0 ? 1 : 2;
};

const onSegment = (p: XYPosition, q: XYPosition, r: XYPosition): boolean => {
    return (
        Math.min(p.x, r.x) - 1e-6 <= q.x &&
        q.x <= Math.max(p.x, r.x) + 1e-6 &&
        Math.min(p.y, r.y) - 1e-6 <= q.y &&
        q.y <= Math.max(p.y, r.y) + 1e-6
    );
};

const segmentsIntersect = (
    p1: XYPosition,
    p2: XYPosition,
    p3: XYPosition,
    p4: XYPosition
): boolean => {
    const o1 = orientation(p1, p2, p3);
    const o2 = orientation(p1, p2, p4);
    const o3 = orientation(p3, p4, p1);
    const o4 = orientation(p3, p4, p2);

    if (o1 !== o2 && o3 !== o4) return true;

    if (o1 === 0 && onSegment(p1, p3, p2)) return true;
    if (o2 === 0 && onSegment(p1, p4, p2)) return true;
    if (o3 === 0 && onSegment(p3, p1, p4)) return true;
    if (o4 === 0 && onSegment(p3, p2, p4)) return true;

    return false;
};

const segmentIntersectsBox = (p1: XYPosition, p2: XYPosition, box: Box): boolean => {
    if (pointInBox(p1, box) || pointInBox(p2, box)) return true;

    const corners: XYPosition[] = [
        { x: box.x, y: box.y },
        { x: box.x + box.width, y: box.y },
        { x: box.x + box.width, y: box.y + box.height },
        { x: box.x, y: box.y + box.height },
    ];

    for (let i = 0; i < 4; i++) {
        const c1 = corners[i];
        const c2 = corners[(i + 1) % 4];
        if (c1 && c2 && segmentsIntersect(p1, p2, c1, c2)) return true;
    }

    return false;
};

// Parses the `M x,y L x,y Q cx,cy x,y ...` path produced by
// `getSmoothStepPath` into an ordered polyline of "bend" points. Corner
// rounding (a handful of px, from the `Q` control point) is intentionally
// collapsed into a single vertex - it doesn't materially change whether a
// node box is crossed, and keeps the overlap test a cheap set of straight
// segment checks.
const parseSmoothStepPathToPoints = (path: string): XYPosition[] => {
    const tokens = path.match(/[MLQ][^MLQ]*/gi) ?? [];
    const points: XYPosition[] = [];

    tokens.forEach((token) => {
        const cmd = token[0]?.toUpperCase();
        const nums = token
            .slice(1)
            .trim()
            .split(/[\s,]+/)
            .filter(Boolean)
            .map(Number);

        if ((cmd === "M" || cmd === "L") && nums.length >= 2) {
            points.push({ x: nums[0] ?? 0, y: nums[1] ?? 0 });
        } else if (cmd === "Q" && nums.length >= 4) {
            // last pair of a quadratic curve command is its endpoint
            points.push({ x: nums[2] ?? 0, y: nums[3] ?? 0 });
        }
    });

    return points;
};

/**
 * Reconstructs the same orthogonal (smoothstep) path that is rendered for
 * an edge, purely from node positions/handles - mirroring
 * `getFallbackAttackPathEdge` in `diagramEdgeUtil.ts` - so the overlap
 * check matches what actually appears on the canvas.
 */
const getEdgePolyline = (
    edge: DiagramEdge, //
    nodesById: Map<string, DiagramNode>,
    allNodes: DiagramNode[]
): XYPosition[] | undefined => {
    const sourceNode = nodesById.get(edge.source);
    const targetNode = nodesById.get(edge.target);
    if (!sourceNode || !targetNode) return undefined;

    try {
        const sourcePosition = getPathHandlePosition(edge.sourceHandle || "");
        const targetPosition = getPathHandlePosition(edge.targetHandle || "");

        const sourcePoint = getAnchorPointFromNode({
            node: sourceNode,
            handlePosition: sourcePosition,
            allNodes,
        });
        const targetPoint = getAnchorPointFromNode({
            node: targetNode,
            handlePosition: targetPosition,
            allNodes,
        });

        try {
            const [path] = getSmoothStepPath({
                sourceX: sourcePoint.x,
                sourceY: sourcePoint.y,
                sourcePosition,
                targetX: targetPoint.x,
                targetY: targetPoint.y,
                targetPosition,
                offset: HANDLE_STUB_OFFSET,
            });
            return parseSmoothStepPathToPoints(path);
        } catch {
            return [sourcePoint, targetPoint];
        }
    } catch {
        // Node position couldn't be resolved (e.g. a broken parentId chain
        // from a corrupted import) - skip this edge for the overlap check
        // rather than failing the whole resolution pass.
        return undefined;
    }
};

const isAncestorDescendantPair = (
    a: DiagramNode,
    b: DiagramNode,
    allNodes: DiagramNode[]
): boolean => {
    return (
        (a.type === CanvasNodeVariantType.clusterNode &&
            isChildNode({ node: b, potentialParentId: a.id, allNodes })) ||
        (b.type === CanvasNodeVariantType.clusterNode &&
            isChildNode({ node: a, potentialParentId: b.id, allNodes }))
    );
};

const findNodeNodeViolations = (nodes: DiagramNode[]): NodeNodeViolation[] => {
    const violations: NodeNodeViolation[] = [];
    const visible = nodes.filter((n) => !n.hidden);

    for (let i = 0; i < visible.length; i++) {
        const nodeA = visible[i];
        const boxA = nodeA && toBox(nodeA, nodes);
        if (!nodeA || !boxA) continue;

        for (let j = i + 1; j < visible.length; j++) {
            const nodeB = visible[j];
            const boxB = nodeB && toBox(nodeB, nodes);
            if (!nodeB || !boxB) continue;

            if (isAncestorDescendantPair(nodeA, nodeB, nodes)) continue;

            if (boxesOverlap(boxA, boxB)) {
                violations.push({ kind: "node-node", nodeAId: nodeA.id, nodeBId: nodeB.id });
            }
        }
    }

    return violations;
};

const findNodeEdgeViolations = (
    nodes: DiagramNode[], //
    edges: DiagramEdge[]
): NodeEdgeViolation[] => {
    const violations: NodeEdgeViolation[] = [];
    const nodesById = new Map(nodes.map((n) => [n.id, n]));

    // Cluster boxes are explicitly allowed to be crossed by edges - only
    // "solid" info nodes need to stay clear.
    const candidateNodes = nodes.filter(
        (n) => !n.hidden && n.type !== CanvasNodeVariantType.clusterNode
    );

    edges
        .filter((e) => !e.hidden)
        .forEach((edge) => {
            const polyline = getEdgePolyline(edge, nodesById, nodes);
            if (!polyline || polyline.length < 2) return;

            candidateNodes.forEach((node) => {
                if (node.id === edge.source || node.id === edge.target) return;

                const box = toBox(node, nodes);
                if (!box) return;
                const inflatedBox = inflateBox(box, NODE_OVERLAP_MARGIN);

                for (let i = 0; i < polyline.length - 1; i++) {
                    const p1 = polyline[i];
                    const p2 = polyline[i + 1];
                    if (!p1 || !p2) continue;
                    if (segmentIntersectsBox(p1, p2, inflatedBox)) {
                        violations.push({ kind: "node-edge", nodeId: node.id, edgeId: edge.id });
                        return;
                    }
                }
            });
        });

    return violations;
};

const findAllViolations = (nodes: DiagramNode[], edges: DiagramEdge[]): Violation[] => {
    return [
        ...findNodeNodeViolations(nodes), //
        ...findNodeEdgeViolations(nodes, edges),
    ];
};

// ####################################################################
// Mover resolution
// ####################################################################

const isDescendantOrSelf = (
    candidateId: string,
    ancestorId: string,
    nodesById: Map<string, DiagramNode>
): boolean => {
    if (candidateId === ancestorId) return true;
    let current = nodesById.get(candidateId);
    while (current?.parentId) {
        if (current.parentId === ancestorId) return true;
        current = nodesById.get(current.parentId);
    }
    return false;
};

/**
 * Decides which node should actually move to resolve a violation involving
 * `node`, and (when applicable) which node's box that move must stay
 * inside:
 *   - If `node` sits inside a cluster and everything else the violation
 *     involves is also inside that same cluster, `node` itself is
 *     repositioned, bounded by its parent cluster's box.
 *   - If any of it comes from outside that cluster, the whole cluster is
 *     moved as a rigid block instead (translating a cluster's own position
 *     carries every descendant with it, since child positions are stored
 *     relative to their parent).
 */
const resolveMover = (
    node: DiagramNode, //
    otherNodeIds: string[],
    nodesById: Map<string, DiagramNode>
): MoverResolution => {
    const parentId = node.parentId;
    if (!parentId) {
        return { moverId: node.id, containedWithinId: undefined };
    }

    const allInternal = otherNodeIds.every((id) => isDescendantOrSelf(id, parentId, nodesById));
    if (allInternal) {
        return { moverId: node.id, containedWithinId: parentId };
    }

    const parentNode = nodesById.get(parentId);
    if (!parentNode) {
        return { moverId: node.id, containedWithinId: undefined };
    }

    // Moving the cluster as a block - if the cluster itself is nested,
    // keep it inside its own parent while searching.
    return { moverId: parentNode.id, containedWithinId: parentNode.parentId || undefined };
};

/**
 * Builds the ordered list of mover options to try for a violation involving
 * `node`. The first option is whatever `resolveMover` decides (cluster
 * block if any part of the conflict is external to it). When that choice
 * is a parent cluster block, a second, fallback option is appended: move
 * `node` itself within that same cluster instead.
 */
const buildMoverAttempts = (
    node: DiagramNode, //
    otherNodeIds: string[],
    nodesById: Map<string, DiagramNode>
): MoverResolution[] => {
    const primary = resolveMover(node, otherNodeIds, nodesById);
    const attempts: MoverResolution[] = [primary];

    if (node.parentId && primary.moverId !== node.id) {
        attempts.push({ moverId: node.id, containedWithinId: node.parentId });
    }

    return attempts;
};

interface GridState {
    i: number; // grid steps along x from the origin
    j: number; // grid steps along y from the origin
    cost: number;
}

const ORTHOGONAL_COST = SEARCH_GRID_STEP;
const DIAGONAL_COST = SEARCH_GRID_STEP * Math.SQRT2;

// Minimal binary min-heap keyed by `cost`, sufficient for the search sizes
// involved here (at most a few thousand grid cells per violation).
class MinHeap {
    private items: GridState[] = [];

    get size() {
        return this.items.length;
    }

    push(item: GridState) {
        this.items.push(item);
        let idx = this.items.length - 1;
        while (idx > 0) {
            const parentIdx = Math.floor((idx - 1) / 2);
            const parent = this.items[parentIdx];
            const current = this.items[idx];
            if (!parent || !current || parent.cost <= current.cost) break;
            [this.items[parentIdx], this.items[idx]] = [current, parent];
            idx = parentIdx;
        }
    }

    pop(): GridState | undefined {
        const top = this.items[0];
        const last = this.items.pop();
        if (this.items.length > 0 && last) {
            this.items[0] = last;
            let idx = 0;
            for (;;) {
                const left = idx * 2 + 1;
                const right = idx * 2 + 2;
                let smallest = idx;
                if (
                    left < this.items.length &&
                    (this.items[left]?.cost ?? Infinity) < (this.items[smallest]?.cost ?? Infinity)
                ) {
                    smallest = left;
                }
                if (
                    right < this.items.length &&
                    (this.items[right]?.cost ?? Infinity) < (this.items[smallest]?.cost ?? Infinity)
                ) {
                    smallest = right;
                }
                if (smallest === idx) break;
                [this.items[idx], this.items[smallest]] = [
                    this.items[smallest] as GridState,
                    this.items[idx] as GridState,
                ];
                idx = smallest;
            }
        }
        return top;
    }
}

const NEIGHBOUR_STEPS: Array<{ di: number; dj: number; cost: number }> = [
    { di: 1, dj: 0, cost: ORTHOGONAL_COST },
    { di: -1, dj: 0, cost: ORTHOGONAL_COST },
    { di: 0, dj: 1, cost: ORTHOGONAL_COST },
    { di: 0, dj: -1, cost: ORTHOGONAL_COST },
    { di: 1, dj: 1, cost: DIAGONAL_COST },
    { di: 1, dj: -1, cost: DIAGONAL_COST },
    { di: -1, dj: 1, cost: DIAGONAL_COST },
    { di: -1, dj: -1, cost: DIAGONAL_COST },
];

const cloneNodesWithOffset = (
    nodes: DiagramNode[], //
    moverId: string,
    offset: XYPosition
): DiagramNode[] => {
    return nodes.map((n) => {
        if (n.id !== moverId) return n;
        return {
            ...n,
            position: {
                x: n.position.x + offset.x,
                y: n.position.y + offset.y,
            },
        };
    });
};

const getNumericDimension = (value: unknown): number | undefined => {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string") {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : undefined;
    }
    return undefined;
};

const getNodeWidth = (node: DiagramNode): number =>
    getNumericDimension(node.width) ?? getNumericDimension(node.style?.width) ?? 0;

const getNodeHeight = (node: DiagramNode): number =>
    getNumericDimension(node.height) ?? getNumericDimension(node.style?.height) ?? 0;

const fitClusterToChildren = (
    clusterId: string, //
    nodes: DiagramNode[]
): DiagramNode[] => {
    const cluster = nodes.find((n) => n.id === clusterId);
    if (!cluster || cluster.type !== CanvasNodeVariantType.clusterNode) return nodes;

    const children = nodes.filter((n) => n.parentId === clusterId && !n.hidden);
    if (children.length === 0) return nodes;

    let minLeft = Infinity;
    let minTop = Infinity;
    let maxRight = -Infinity;
    let maxBottom = -Infinity;

    children.forEach((child) => {
        const width = getNodeWidth(child);
        const height = getNodeHeight(child);
        minLeft = Math.min(minLeft, child.position.x);
        minTop = Math.min(minTop, child.position.y);
        maxRight = Math.max(maxRight, child.position.x + width);
        maxBottom = Math.max(maxBottom, child.position.y + height);
    });

    if (![minLeft, minTop, maxRight, maxBottom].every(Number.isFinite)) return nodes;

    const fittedWidth = maxRight - minLeft + CLUSTER_FIT_MARGIN * 2;
    const fittedHeight = maxBottom - minTop + CLUSTER_FIT_MARGIN * 2;

    const minWidth = getNumericDimension(cluster.style?.minWidth) ?? 0;
    const minHeight = getNumericDimension(cluster.style?.minHeight) ?? 0;
    const newWidth = Math.max(fittedWidth, minWidth);
    const newHeight = Math.max(fittedHeight, minHeight);

    // Slack introduced by the minWidth/minHeight clamp is split evenly so
    // the margin stays as close to even on every side as possible, instead
    // of all landing on the right/bottom edge.
    const extraWidth = newWidth - fittedWidth;
    const extraHeight = newHeight - fittedHeight;

    const relativeLeftShift = minLeft - CLUSTER_FIT_MARGIN - extraWidth / 2;
    const relativeTopShift = minTop - CLUSTER_FIT_MARGIN - extraHeight / 2;

    const unchanged =
        Math.abs(relativeLeftShift) < 1e-6 &&
        Math.abs(relativeTopShift) < 1e-6 &&
        Math.abs(newWidth - getNodeWidth(cluster)) < 1e-6 &&
        Math.abs(newHeight - getNodeHeight(cluster)) < 1e-6;
    if (unchanged) return nodes;

    return nodes.map((n) => {
        if (n.id === clusterId) {
            return {
                ...n,
                position: {
                    x: n.position.x + relativeLeftShift,
                    y: n.position.y + relativeTopShift,
                },
                width: newWidth,
                height: newHeight,
                style: {
                    ...n.style,
                    width: newWidth,
                    height: newHeight,
                },
            };
        }
        if (n.parentId === clusterId) {
            return {
                ...n,
                position: {
                    x: n.position.x - relativeLeftShift,
                    y: n.position.y - relativeTopShift,
                },
            };
        }
        return n;
    });
};

const resizeClusterAncestorChainToFitChildren = (
    nodes: DiagramNode[], //
    startClusterId: string | undefined
): DiagramNode[] => {
    if (!startClusterId) return nodes;

    let workingNodes = nodes;
    let currentId: string | undefined = startClusterId;
    const visited = new Set<string>();

    while (currentId && !visited.has(currentId)) {
        visited.add(currentId);
        workingNodes = fitClusterToChildren(currentId, workingNodes);
        const current = workingNodes.find((n) => n.id === currentId);
        currentId = current?.parentId || undefined;
    }

    return workingNodes;
};

const searchMinimalOffset = ({
    nodes,
    edges,
    moverId,
    containedWithinId,
    baselineViolationCount,
}: {
    nodes: DiagramNode[];
    edges: DiagramEdge[];
    moverId: string;
    containedWithinId?: string | undefined;
    baselineViolationCount: number;
}): SearchResult | undefined => {
    const moverNode = nodes.find((n) => n.id === moverId);
    if (!moverNode) return undefined;

    const moverBox = toBox(moverNode, nodes);
    if (!moverBox) return undefined;

    let bounds: Box | undefined;
    if (containedWithinId) {
        const containerNode = nodes.find((n) => n.id === containedWithinId);
        bounds = containerNode ? toBox(containerNode, nodes) : undefined;
    }

    const isOffsetWithinBounds = (offset: XYPosition): boolean => {
        if (!bounds) {
            return (
                Math.abs(offset.x) <= UNBOUNDED_SEARCH_MARGIN &&
                Math.abs(offset.y) <= UNBOUNDED_SEARCH_MARGIN
            );
        }
        const newX = moverBox.x + offset.x;
        const newY = moverBox.y + offset.y;
        return (
            newX >= bounds.x &&
            newY >= bounds.y &&
            newX + moverBox.width <= bounds.x + bounds.width &&
            newY + moverBox.height <= bounds.y + bounds.height
        );
    };

    const heap = new MinHeap();
    const visited = new Set<string>();
    heap.push({ i: 0, j: 0, cost: 0 });
    visited.add("0,0");

    let expansions = 0;

    while (heap.size > 0 && expansions < MAX_SEARCH_EXPANSIONS) {
        const current = heap.pop();
        if (!current) break;
        expansions += 1;

        const offset: XYPosition = {
            x: current.i * SEARCH_GRID_STEP,
            y: current.j * SEARCH_GRID_STEP,
        };

        if (isOffsetWithinBounds(offset)) {
            const candidateNodes = cloneNodesWithOffset(nodes, moverId, offset);
            const resizedNodes = resizeClusterAncestorChainToFitChildren(
                candidateNodes,
                containedWithinId
            );
            const candidateEdges = getRealignedEdgeHandles(resizedNodes, edges);
            const violationCount = findAllViolations(resizedNodes, candidateEdges).length;

            if (violationCount < baselineViolationCount) {
                return { offset, nodes: resizedNodes, edges: candidateEdges };
            }
        }

        for (const step of NEIGHBOUR_STEPS) {
            const nextI = current.i + step.di;
            const nextJ = current.j + step.dj;
            const key = `${nextI},${nextJ}`;
            if (visited.has(key)) continue;

            const nextOffset: XYPosition = {
                x: nextI * SEARCH_GRID_STEP,
                y: nextJ * SEARCH_GRID_STEP,
            };
            // Prune the frontier so it never wanders outside the region we
            // could possibly accept a solution in - keeps the search finite
            // and fast even for unbounded (top-level) movers.
            const margin = bounds
                ? Math.max(bounds.width, bounds.height) + SEARCH_GRID_STEP
                : UNBOUNDED_SEARCH_MARGIN;
            if (Math.abs(nextOffset.x) > margin || Math.abs(nextOffset.y) > margin) continue;

            visited.add(key);
            heap.push({ i: nextI, j: nextJ, cost: current.cost + step.cost });
        }
    }

    return undefined;
};

export const resolveDiagramLayoutOverlaps = (
    nodes: DiagramNode[], //
    edges: DiagramEdge[]
): { nodes: DiagramNode[]; edges: DiagramEdge[] } => {
    let workingNodes = nodes.map((n) => ({ ...n, position: { ...n.position } }));
    let workingEdges = getRealignedEdgeHandles(workingNodes, edges);

    // Violations we couldn't resolve (e.g. a node too large for its
    // cluster) are tracked so we don't spin forever retrying them.
    const unresolvable = new Set<string>();

    const violationKey = (v: Violation): string =>
        v.kind === "node-node"
            ? `node-node:${[v.nodeAId, v.nodeBId].sort().join("|")}`
            : `node-edge:${v.nodeId}|${v.edgeId}`;

    for (let iteration = 0; iteration < MAX_RESOLUTION_ITERATIONS; iteration++) {
        const violations = findAllViolations(workingNodes, workingEdges).filter(
            (v) => !unresolvable.has(violationKey(v))
        );
        if (violations.length === 0) break;

        const violation = violations[0];
        if (!violation) break;

        const nodesById = new Map(workingNodes.map((n) => [n.id, n]));
        const baselineViolationCount = findAllViolations(workingNodes, workingEdges).length;

        const attempts: MoverResolution[] = [];
        if (violation.kind === "node-node") {
            const nodeA = nodesById.get(violation.nodeAId);
            const nodeB = nodesById.get(violation.nodeBId);
            if (nodeB) attempts.push(...buildMoverAttempts(nodeB, [violation.nodeAId], nodesById));
            if (nodeA) attempts.push(...buildMoverAttempts(nodeA, [violation.nodeBId], nodesById));
        } else {
            const node = nodesById.get(violation.nodeId);
            const edge = workingEdges.find((e) => e.id === violation.edgeId);
            if (node && edge) {
                const sourceNode = nodesById.get(edge.source);
                const targetNode = nodesById.get(edge.target);

                attempts.push(...buildMoverAttempts(node, [edge.source, edge.target], nodesById));
                if (sourceNode) {
                    attempts.push(
                        ...buildMoverAttempts(
                            sourceNode,
                            [violation.nodeId, edge.target],
                            nodesById
                        )
                    );
                }
                if (targetNode) {
                    attempts.push(
                        ...buildMoverAttempts(
                            targetNode,
                            [violation.nodeId, edge.source],
                            nodesById
                        )
                    );
                }
            }
        }

        // Evaluate every candidate mover and keep whichever produces the
        // smallest actual movement, rather than stopping at the first one
        // that happens to work - now that a violation can be resolved by
        // moving any of several different nodes, "first found" and
        // "smallest movement" are no longer the same thing.
        let result: SearchResult | undefined;
        let bestCost = Infinity;
        for (const attempt of attempts) {
            const candidate = searchMinimalOffset({
                nodes: workingNodes,
                edges: workingEdges,
                moverId: attempt.moverId,
                containedWithinId: attempt.containedWithinId,
                baselineViolationCount,
            });
            if (!candidate) continue;

            const cost = Math.hypot(candidate.offset.x, candidate.offset.y);
            if (cost < bestCost) {
                bestCost = cost;
                result = candidate;
            }
        }

        if (!result) {
            unresolvable.add(violationKey(violation));
            continue;
        }

        workingNodes = result.nodes;
        workingEdges = result.edges;
    }

    return { nodes: workingNodes, edges: workingEdges };
};
