import { EdgeProps, InternalNode, Position } from "@xyflow/react";

import { DiagramEdge, DiagramNode } from "#root/interfaces/diagram";
import { getPositionFromHandleId } from "#root/utils/diagram/diagramNodeUtil";

const getHandleCoordsByPosition = ({
    node, //
    handlePosition,
}: {
    node: InternalNode<DiagramNode>;
    handlePosition: Position;
}) => {
    const handleBounds = node?.internals?.handleBounds;
    const allHandles = [
        ...(handleBounds?.source ?? []), //
        ...(handleBounds?.target ?? []),
    ];
    const handle = allHandles.find((h) => h.position === handlePosition);
    if (!handle) throw new Error("Handle not found for the given position");

    // internals.positionAbsolute is the node's real top-left canvas position,
    // already resolved for nested/parent nodes by React Flow itself.
    const positionAbsolute = node?.internals?.positionAbsolute ?? { x: 0, y: 0 };

    // handle.x / handle.y / handle.width / handle.height are measured directly
    // from the handle's DOM bounding box (relative to the node), so adding half
    // the handle's own size gives us its true visual center - no guessed offsets
    // needed for any position.
    const x = positionAbsolute.x + handle.x + handle.width / 2;
    const y = positionAbsolute.y + handle.y + handle.height / 2;
    return [x, y];
};

export const getEdgeParams = ({
    source, //
    target,
    edgeProps,
}: {
    source: InternalNode<DiagramNode>;
    target: InternalNode<DiagramNode>;
    edgeProps: EdgeProps<DiagramEdge>;
    allNodes: DiagramNode[];
}) => {
    const sourceHandlePosition = getPositionFromHandleId(edgeProps?.sourceHandleId || "");
    const [sx, sy] = getHandleCoordsByPosition({
        node: source, //
        handlePosition: sourceHandlePosition,
    });
    const targetHandlePosition = getPositionFromHandleId(edgeProps?.targetHandleId || "");
    const [tx, ty] = getHandleCoordsByPosition({
        node: target, //
        handlePosition: targetHandlePosition,
    });

    return {
        sourceX: sx as number,
        sourceY: sy as number,
        targetX: tx as number,
        targetY: ty as number,
        sourcePosition: sourceHandlePosition,
        targetPosition: targetHandlePosition,
    };
};
