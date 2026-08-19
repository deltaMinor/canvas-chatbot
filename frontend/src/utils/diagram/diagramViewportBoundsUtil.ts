import { Rect } from "@xyflow/react";

import { CanvasNodeVariantType, DiagramNode } from "#root/interfaces/diagram";
import { getNodePositionAbsolute } from "#root/utils/diagram/diagramNodePositionUtil";

export const getFocusNodeFitBounds = ({
    node,
    allNodes,
    nodesRect,
}: {
    node: DiagramNode;
    allNodes: DiagramNode[];
    nodesRect: Rect;
}): Rect | null => {
    if (node.type !== CanvasNodeVariantType.clusterNode.toString()) {
        return null;
    }

    const positionAbsolute = getNodePositionAbsolute({
        node,
        allNodes,
    });
    const positionX = positionAbsolute?.x ?? nodesRect.x;
    const positionY = positionAbsolute?.y ?? nodesRect.y;
    const nodeWidth = node.width ?? nodesRect.width;
    const nodeHeight = node.height ?? nodesRect.height;

    return {
        x: positionX - 24,
        y: positionY - 36,
        width: nodeWidth + 48,
        height: nodeHeight + 72,
    };
};

export const getFocusEdgeFitBounds = ({
    sourceNode,
    targetNode,
    getNodesBounds,
}: {
    sourceNode: DiagramNode;
    targetNode: DiagramNode;
    getNodesBounds: (nodes: DiagramNode[]) => Rect;
}): Rect => {
    return getNodesBounds([sourceNode, targetNode]);
};
