import { DiagramEdge, DiagramNode } from "#root/interfaces/diagram";
import { getNodeInfo } from "#root/utils/diagram/diagramNodePositionUtil";

type Side = "top" | "bottom" | "left" | "right";

interface Box {
    x: number;
    y: number;
    width: number;
    height: number;
}

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

const center = (box: Box) => ({ x: box.x + box.width / 2, y: box.y + box.height / 2 });

const handlePoint = (box: Box, side: Side) => {
    const c = center(box);
    switch (side) {
        case "top":
            return { x: c.x, y: box.y };
        case "bottom":
            return { x: c.x, y: box.y + box.height };
        case "left":
            return { x: box.x, y: c.y };
        case "right":
            return { x: box.x + box.width, y: c.y };
    }
};

const containsX = (box: Box, x: number) => x >= box.x && x <= box.x + box.width;
const containsY = (box: Box, y: number) => y >= box.y && y <= box.y + box.height;

const computeHandles = (
    sourceBox: Box,
    targetBox: Box
): { sourceHandle: string; targetHandle: string } => {
    const s = center(sourceBox);
    const t = center(targetBox);
    const dx = t.x - s.x;
    const dy = t.y - s.y;

    if (Math.abs(dy) > Math.abs(dx)) {
        // Vertical case: source_top or source_bottom
        const targetAbove = dy < 0;
        const sourceSide: Side = targetAbove ? "top" : "bottom";
        const sourceHandle = targetAbove ? "source_top" : "source_bottom";
        const hp = handlePoint(sourceBox, sourceSide);

        if (containsX(targetBox, hp.x)) {
            return { sourceHandle, targetHandle: targetAbove ? "target_bottom" : "target_top" };
        }
        const targetCenter = center(targetBox);
        return {
            sourceHandle,
            targetHandle: targetCenter.x < hp.x ? "target_right" : "target_left",
        };
    }

    // Horizontal case: source_left or source_right
    const targetLeft = dx < 0;
    const sourceSide: Side = targetLeft ? "left" : "right";
    const sourceHandle = targetLeft ? "source_left" : "source_right";
    const hp = handlePoint(sourceBox, sourceSide);

    if (containsY(targetBox, hp.y)) {
        return { sourceHandle, targetHandle: targetLeft ? "target_right" : "target_left" };
    }
    const targetCenter = center(targetBox);
    return {
        sourceHandle,
        targetHandle: targetCenter.y < hp.y ? "target_bottom" : "target_top",
    };
};

export const getRealignedEdgeHandles = (
    nodes: DiagramNode[],
    edges: DiagramEdge[]
): DiagramEdge[] => {
    const nodesById = new Map(nodes.map((n) => [n.id, n]));

    return edges.map((edge) => {
        try {
            const sourceNode = nodesById.get(edge.source);
            const targetNode = nodesById.get(edge.target);
            if (!sourceNode || !targetNode) return edge;

            const sourceBox = toBox(sourceNode, nodes);
            const targetBox = toBox(targetNode, nodes);
            if (!sourceBox || !targetBox) return edge;

            const { sourceHandle, targetHandle } = computeHandles(sourceBox, targetBox);

            const handleChanged =
                sourceHandle !== edge.sourceHandle || targetHandle !== edge.targetHandle;
            if (!handleChanged) return edge;

            const { lineSegments: _staleLineSegments, ...restEdgeData } = edge.data ?? {};

            return { ...edge, sourceHandle, targetHandle, data: restEdgeData };
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error(`Failed to realign handles for edge "${edge.id}".`, error);
            return edge;
        }
    });
};
