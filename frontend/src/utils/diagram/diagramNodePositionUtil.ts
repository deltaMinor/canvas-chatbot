import { XYPosition } from "@xyflow/react";

import { CanvasColumn, DiagramCanvas, DiagramNode } from "#root/interfaces/diagram";

export const getDFRefPosition = (canvas: DiagramCanvas): Record<CanvasColumn, number[]> => {
    const nodes = canvas.nodes;

    const options: Record<CanvasColumn, number[]> = {
        [CanvasColumn.left]: [0, 0],
        [CanvasColumn.right]: [0, 0],
        [CanvasColumn.top]: [0, 0],
        [CanvasColumn.bottom]: [0, 0],
    };

    if (!nodes || nodes.length === 0) return options; // ✅ early return

    const filtered_nodes = nodes.filter((n) => n.parentId === "");
    if (filtered_nodes.length === 0) return options; // ✅ no root nodes

    const x_values: number[] = filtered_nodes.map((n) => n.position.x) || [];
    const y_values: number[] = filtered_nodes.map((n) => n.position.y) || [];
    //
    const min_x = Math.min(...x_values);
    const max_x = Math.max(
        ...(filtered_nodes.map((node) => node.position.x + (node.width || 0)) || [])
    );
    //
    const min_y = Math.min(...y_values);
    const max_y = Math.max(
        ...(filtered_nodes.map((node) => node.position.y + (node.height || 0)) || [])
    );

    const mid_y = (min_y + max_y) / 2;
    const mid_x = (min_x + max_x) / 2;

    options[CanvasColumn.left] = [min_x, mid_y];
    options[CanvasColumn.right] = [max_x, mid_y];
    options[CanvasColumn.top] = [mid_x, min_y];
    options[CanvasColumn.bottom] = [mid_x, max_y];

    return options;
};

export const getRelativePosition = ({
    allNodes,
    node,
    parentNode,
    //
    positionAbsolute,
}: {
    allNodes: DiagramNode[];
    node: DiagramNode;
    parentNode: DiagramNode;
    //
    positionAbsolute?: XYPosition;
}) => {
    if (!parentNode) return node.position;

    const parent_info = getNodeInfo({
        node: parentNode, //
        allNodes,
        // positionAbsolute,
    });
    if (!parent_info) return node.position;

    const node_info = getNodeInfo({
        node, //
        allNodes,
        positionAbsolute: positionAbsolute || { x: 0, y: 0 },
    });
    if (!node_info) return node.position;

    const x = node_info.nodeX_left - parent_info.nodeX_left;
    const y = node_info.nodeY_top - parent_info.nodeY_top;
    return { x, y };
};

export const getNodePositionAbsoluteRecursive = ({
    node,
    allNodes,
    position_absolute,
}: {
    node: DiagramNode; //
    allNodes: DiagramNode[];
    position_absolute: XYPosition;
}) => {
    const parentId = node.parentId;
    if (!parentId) return;

    const parent_node = allNodes.find((n) => n.id === parentId);
    if (!parent_node) throw new Error("Parent node not found.");
    const parent_position = parent_node.position;
    position_absolute.x += parent_position.x;
    position_absolute.y += parent_position.y;

    getNodePositionAbsoluteRecursive({
        node: parent_node, //
        allNodes,
        position_absolute,
    });
};

export const getNodePositionAbsolute = ({
    node, //
    allNodes,
}: {
    node: DiagramNode; //
    allNodes: DiagramNode[];
}) => {
    try {
        const position_absolute = structuredClone(node.position);
        getNodePositionAbsoluteRecursive({
            node,
            allNodes,
            position_absolute,
        });
        return position_absolute;
    } catch (error) {
        throw new Error(`Error getting node position absolute: ${error}`);
    }
};

export const getNodeInfo = ({
    node,
    allNodes,
    positionAbsolute,
}: {
    node: DiagramNode; //
    allNodes: DiagramNode[];
    positionAbsolute?: XYPosition;
}) => {
    const _positionAbsolute =
        positionAbsolute ||
        getNodePositionAbsolute({
            node, //
            allNodes,
        });
    if (!_positionAbsolute || !node?.style?.width || !node?.style?.height) {
        return;
    }

    const nodeWidth = node.width || Number(node.style.width?.toString()) || 0;
    const nodeHeight = node.height || Number(node.style.height?.toString()) || 0;
    const nodeX_left = _positionAbsolute.x;
    const nodeX_right = _positionAbsolute.x + nodeWidth;
    const nodeY_top = _positionAbsolute.y;
    const nodeY_bottom = _positionAbsolute.y + nodeHeight;

    return {
        nodeWidth,
        nodeHeight,
        nodeX_left,
        nodeX_right,
        nodeY_top,
        nodeY_bottom,
    };
};
