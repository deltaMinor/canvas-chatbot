import { ReactFlowInstance, XYPosition } from "@xyflow/react";

import {
    ALLOWED_CHILD_NODES,
    ALLOWED_CHILD_NODE_CARD_REF_KEYS,
    ALLOWED_PARENT_NODES,
    ALLOWED_PARENT_NODE_CARD_REF_KEYS,
    DEFAULT_ZINDEX_NODE,
} from "#root/constants/diagram";
import {
    CanvasNodeVariantType,
    DiagramEdge,
    DiagramNode,
    NodeInfo,
} from "#root/interfaces/diagram";
import {
    getNodeInfo,
    getNodePositionAbsolute,
    getRelativePosition,
} from "#root/utils/diagram/diagramNodePositionUtil";
import { getNodeArrayIndex, moveNodeInPlace } from "#root/utils/diagram/diagramNodeUtil";

const getBoundaryInfo = (nodeInfo: NodeInfo, parentNodeInfo: NodeInfo) => {
    const isWithinParentLeftBoundary = nodeInfo.nodeX_left >= parentNodeInfo.nodeX_left;
    const isWithinParentRightBoundary = nodeInfo.nodeX_right <= parentNodeInfo.nodeX_right;
    const isWithinParentTopBoundary = nodeInfo.nodeY_top >= parentNodeInfo.nodeY_top;
    const isWithinParentBottomBoundary = nodeInfo.nodeY_bottom <= parentNodeInfo.nodeY_bottom;

    return {
        isWithinParent:
            isWithinParentLeftBoundary &&
            isWithinParentRightBoundary &&
            isWithinParentTopBoundary &&
            isWithinParentBottomBoundary,
    };
};

export const getParentGroupNodes = ({
    node,
    allNodes,
    positionAbsolute,
}: {
    node: DiagramNode;
    allNodes: DiagramNode[];
    positionAbsolute?: XYPosition;
}) => {
    const parentGroupNodes: DiagramNode[] = [];
    const nodeInfo = getNodeInfo({
        node,
        allNodes,
        ...(positionAbsolute && { positionAbsolute }),
    });
    if (!nodeInfo) return parentGroupNodes;

    allNodes.forEach((candidateNode) => {
        if (candidateNode.type !== CanvasNodeVariantType.clusterNode) return;

        const parentNodeInfo = getNodeInfo({
            node: candidateNode,
            allNodes,
        });
        if (!parentNodeInfo) return;

        const boundaryInfo = getBoundaryInfo(nodeInfo, parentNodeInfo);
        if (boundaryInfo.isWithinParent && candidateNode.id !== node.id) {
            if (candidateNode?.data?.type !== node?.data?.type) {
                throw new Error("Node type mismatch.");
            }
            parentGroupNodes.push(candidateNode);
        }
    });

    return parentGroupNodes;
};

const getChildGroupNode = (
    parentGroupNode: DiagramNode,
    parentGroupNodes: DiagramNode[]
): DiagramNode => {
    const childGroupNode = parentGroupNodes.find((node) => node.parentId === parentGroupNode.id);
    return childGroupNode ? getChildGroupNode(childGroupNode, parentGroupNodes) : parentGroupNode;
};

export const getChildNodesRecursive = (node: DiagramNode, nodes: DiagramNode[]) => {
    if (node.type !== CanvasNodeVariantType.clusterNode) return [];

    const childNodes = nodes.filter((candidateNode) => candidateNode.parentId === node.id);
    if (!childNodes.length) return [];

    const remainingNodes = nodes.filter((candidateNode) => candidateNode.id !== node.id);
    let allChildNodes = [...childNodes];
    childNodes.forEach((childNode) => {
        allChildNodes = allChildNodes.concat(getChildNodesRecursive(childNode, remainingNodes));
    });

    return allChildNodes;
};

export const getParentNodeFromParentGroupNodes = (
    node: DiagramNode,
    parentGroupNodes: DiagramNode[]
) => {
    if (parentGroupNodes.length === 0 && node.parentId) return undefined;
    if (parentGroupNodes.length === 1 && parentGroupNodes[0]?.id !== node.id) {
        return parentGroupNodes[0];
    }
    if (parentGroupNodes.length > 1) {
        const rootGroupNode = parentGroupNodes.find((candidateNode) => !candidateNode.parentId);
        return rootGroupNode ? getChildGroupNode(rootGroupNode, parentGroupNodes) : undefined;
    }
    return undefined;
};

export const updateNodeAttributes = ({
    node,
    allNodes,
    positionAbsolute,
}: {
    node: DiagramNode;
    allNodes: DiagramNode[];
    positionAbsolute?: XYPosition;
}) => {
    const parentGroupNodes = getParentGroupNodes({
        node,
        allNodes,
        ...(positionAbsolute && { positionAbsolute }),
    });
    const parentNode = getParentNodeFromParentGroupNodes(node, parentGroupNodes);

    if (parentNode) {
        node.parentId = parentNode.id;
        node.position = getRelativePosition({
            allNodes,
            node,
            parentNode,
            ...(positionAbsolute && { positionAbsolute }),
        });
        node.zIndex = DEFAULT_ZINDEX_NODE;
    } else {
        node.parentId = "";
        node.zIndex = DEFAULT_ZINDEX_NODE;
    }
    node.hidden = false;

    return { parentGroupNodes, parentNode };
};

export const updateChildNodesRecursive = ({
    node,
    nodes,
}: {
    node: DiagramNode;
    nodes: DiagramNode[];
}) => {
    const childNodes = nodes.filter((candidateNode) => candidateNode.parentId === node.id);
    if (!childNodes.length) return;

    const parentNodeIndex = getNodeArrayIndex(node, nodes);
    childNodes.forEach((childNode, childNodeIndex) => {
        moveNodeInPlace({
            nodes,
            fromIndex: getNodeArrayIndex(childNode, nodes),
            toIndex: parentNodeIndex + childNodeIndex + 1,
        });
        updateChildNodesRecursive({
            node: childNode,
            nodes,
        });
    });
};

export const checkIfNodeParentChildIconPairAllowed = (
    changedNode: DiagramNode,
    changedParentNode?: DiagramNode
) => {
    const changedNodeIcon = changedNode?.data?.icon || "";
    const changedParentNodeIcon = changedParentNode?.data?.icon || "";
    const allowedParentNodeIcons =
        ALLOWED_PARENT_NODES[changedNodeIcon as keyof typeof ALLOWED_PARENT_NODES] ?? [];

    if (allowedParentNodeIcons.length && !changedParentNodeIcon) {
        throw new Error("Parent node is required.");
    }
    if (allowedParentNodeIcons.length && !allowedParentNodeIcons.includes(changedParentNodeIcon)) {
        throw new Error("Forbidden parent node.");
    }

    const allowedChildNodeIcons =
        ALLOWED_CHILD_NODES[changedParentNodeIcon as keyof typeof ALLOWED_CHILD_NODES];
    if (allowedChildNodeIcons?.length && !allowedChildNodeIcons.includes(changedNodeIcon)) {
        throw new Error("Forbidden child node.");
    }
};

export const checkIfNodeParentChildCardRefKeyPairAllowed = (
    changedNode: DiagramNode,
    changedParentNode?: DiagramNode
) => {
    if (changedParentNode?.hidden) return;

    const changedNodeCardRefKey = changedNode?.data?.cardRefKey || "";
    const changedParentNodeCardRefKey = changedParentNode?.data?.cardRefKey || "";
    const allowedParentNodeCardRefKeys =
        ALLOWED_PARENT_NODE_CARD_REF_KEYS[
            changedNodeCardRefKey as keyof typeof ALLOWED_PARENT_NODE_CARD_REF_KEYS
        ];
    if (
        !!allowedParentNodeCardRefKeys?.length &&
        !allowedParentNodeCardRefKeys.includes(changedParentNodeCardRefKey)
    ) {
        throw new Error("Forbidden parent node.");
    }

    const allowedChildNodeCardRefKeys =
        ALLOWED_CHILD_NODE_CARD_REF_KEYS[
            changedParentNodeCardRefKey as keyof typeof ALLOWED_CHILD_NODE_CARD_REF_KEYS
        ];
    if (
        !!allowedChildNodeCardRefKeys?.length &&
        !allowedChildNodeCardRefKeys.includes(changedNodeCardRefKey)
    ) {
        throw new Error("Forbidden child node.");
    }
};

export const updateNodeIfChangedParentNode = ({
    allNodes,
    canvasNodes,
    changedNode,
    parentNode,
    reactFlow,
}: {
    allNodes: DiagramNode[];
    canvasNodes: DiagramNode[];
    changedNode: DiagramNode;
    parentNode?: DiagramNode;
    reactFlow: ReactFlowInstance<DiagramNode, DiagramEdge>;
}) => {
    const internalNode = reactFlow.getInternalNode(changedNode.id);
    if (!internalNode) throw new Error("Internal node not found.");
    const positionAbsolute = internalNode.internals.positionAbsolute;

    if (!parentNode || parentNode.hidden) {
        changedNode.parentId = "";
        changedNode.zIndex = DEFAULT_ZINDEX_NODE;
        changedNode.position = positionAbsolute;
        return;
    }

    changedNode.parentId = parentNode.id;
    changedNode.zIndex = DEFAULT_ZINDEX_NODE;
    changedNode.position = getRelativePosition({
        allNodes,
        node: changedNode,
        parentNode,
        positionAbsolute,
    });

    moveNodeInPlace({
        nodes: canvasNodes,
        fromIndex: getNodeArrayIndex(changedNode, canvasNodes),
        toIndex: getNodeArrayIndex(parentNode, canvasNodes) + 1,
    });
};

export const updateCanvasNodesOnNodeDragStop = ({
    allNodes,
    canvasNodes,
    changedNode,
    reactFlow,
}: {
    allNodes: DiagramNode[];
    canvasNodes: DiagramNode[];
    changedNode: DiagramNode;
    reactFlow: ReactFlowInstance<DiagramNode, DiagramEdge>;
}) => {
    const changedParentGroupNodes = getParentGroupNodes({ node: changedNode, allNodes });
    const changedParentNode = getParentNodeFromParentGroupNodes(
        changedNode,
        changedParentGroupNodes
    );

    updateNodeIfChangedParentNode({
        allNodes,
        canvasNodes,
        changedNode,
        ...(changedParentNode && { parentNode: changedParentNode }),
        reactFlow,
    });

    updateChildNodesRecursive({ node: changedNode, nodes: canvasNodes });
    checkIfNodeParentChildIconPairAllowed(changedNode, changedParentNode);
    checkIfNodeParentChildCardRefKeyPairAllowed(changedNode, changedParentNode);

    canvasNodes.forEach((canvasNode) => {
        if (canvasNode.id !== changedNode.id) {
            canvasNode.selected = false;
            return;
        }
        changedNode.selected = true;
        Object.assign(canvasNode, changedNode);
    });
};

export const checkIfNodePositionChanged = ({
    allNodes,
    changedNode,
    refNodes,
    reactFlow,
}: {
    allNodes: DiagramNode[];
    changedNode: DiagramNode;
    refNodes: DiagramNode[];
    reactFlow: ReactFlowInstance<DiagramNode, DiagramEdge>;
}) => {
    const internalNode = reactFlow.getInternalNode(changedNode.id);
    if (!internalNode) throw new Error("Internal node not found.");
    const positionAbsolute = internalNode.internals.positionAbsolute;

    const refNode = refNodes.find((node) => node.id === changedNode.id);
    if (!refNode) throw new Error("Node not found in canvas nodes.");

    const refNodePositionAbsolute = getNodePositionAbsolute({ node: refNode, allNodes });
    return !(
        positionAbsolute.x === refNodePositionAbsolute.x &&
        positionAbsolute.y === refNodePositionAbsolute.y
    );
};
