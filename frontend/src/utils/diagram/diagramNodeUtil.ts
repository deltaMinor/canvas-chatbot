import { Node, Position, ResizeParams } from "@xyflow/react";

import {
    DESELECTED_EDGE_OPACITY,
    DESELECTED_NODE_OPACITY,
    SELECTED_NODE_EDGE_OPACITY,
    default_node,
} from "#root/constants/diagram";
import {
    CanvasNodeType,
    CanvasNodeVariantType,
    CanvasType,
    DiagramCanvas,
    DiagramNode,
    NodeInfo,
    NodeVisibilityFuncProps,
    ProjectDiagram,
} from "#root/interfaces/diagram";
import { AttackPath } from "#root/interfaces/register";
import { NodeIconKey } from "#root/interfaces/svg";
import { NodeIconKeyBridgeMapping } from "#root/interfaces/svgBridgeMapping";
import { UserStoryCardIconMapping } from "#root/interfaces/userstoryDrawer";

import { getNodeInfo } from "./diagramNodePositionUtil";
import { getIconType } from "./diagramTerraform";

export const getAllPathNodeIds = (
    canvas: DiagramCanvas[] //
) => {
    const path_nodes =
        canvas?.flatMap((c) => {
            const attackPaths = c.ref.threat_scenario_ref?.attackPaths || [];
            return (
                attackPaths.flatMap((p) => [
                    ...(p.nodes || []),
                    ...((p.steps || []).map((step) => step.nodeId).filter(Boolean) as string[]),
                ]) || []
            );
        }) || [];
    return Array.from(new Set(path_nodes));
};

const getComparableNodeId = (node: DiagramNode) => {
    return `${node?.data?.["originalNodeId"] || node?.id || ""}`;
};

const getThreatScenarioComparableNodeLookup = ({
    canvas,
    selectedCanvas,
}: {
    canvas: DiagramCanvas[];
    selectedCanvas?: DiagramCanvas;
}) => {
    const selectedCanvasNodes = selectedCanvas?.nodes ?? [];
    const allNodes = [
        ...(canvas?.flatMap((entry) => entry.nodes ?? []) ?? []),
        ...selectedCanvasNodes,
    ];

    return allNodes.reduce(
        (acc, currentNode) => {
            acc[currentNode.id] = currentNode;
            acc[getComparableNodeId(currentNode)] = currentNode;
            return acc;
        },
        {} as Record<string, DiagramNode>
    );
};

const getComparableAncestorNodeIds = ({
    node,
    lookup,
}: {
    node: DiagramNode;
    lookup: Record<string, DiagramNode>;
}) => {
    const visited = new Set<string>();
    const ancestorComparableNodeIds: string[] = [];

    let currentParentId = node.parentId || "";
    while (currentParentId && !visited.has(currentParentId)) {
        visited.add(currentParentId);
        const parentNode = lookup[currentParentId];
        if (!parentNode) break;

        ancestorComparableNodeIds.push(getComparableNodeId(parentNode));
        currentParentId = parentNode.parentId || "";
    }

    return ancestorComparableNodeIds;
};

export const getMultiPathNodes = (
    canvas: DiagramCanvas[],
    _nodes: DiagramNode[] //
) => {
    const pathNodeIds = getAllPathNodeIds(canvas);
    return _nodes?.map((node) => {
        if (!!pathNodeIds?.includes(getComparableNodeId(node))) {
            return {
                ...node,
                connectable: false,
                deletable: false,
                draggable: false,
                selectable: false,
                style: {
                    ...node?.style, //
                    opacity: SELECTED_NODE_EDGE_OPACITY,
                },
            };
        }
        return {
            ...node,
            selected: false,
            connectable: false,
            deletable: false,
            draggable: false,
            selectable: false,
            style: {
                ...node?.style, //
                opacity: DESELECTED_EDGE_OPACITY,
            },
        };
    });
};

export const getSinglePathNodes = (
    summaryNodes: DiagramNode[], //
    selectedCanvas?: DiagramCanvas,
    selectedPath?: AttackPath
) => {
    const selectedCanvasNodes = selectedCanvas?.nodes ?? [];
    const selectedPathNodes = selectedCanvasNodes.filter((e) => {
        return !!selectedPath //
            ? selectedPath?.nodes?.includes(e.id)
            : false;
    });
    const selectedPathClusterNodeIds =
        selectedPathNodes
            ?.filter((n) => {
                return n.type === CanvasNodeVariantType.clusterNode;
            })
            ?.map((n) => n.id) || [];
    const selectedPathClusterInfoNodeIds =
        summaryNodes
            ?.filter((n) => {
                if (!n.parentId) return false;
                return !!selectedPathClusterNodeIds?.includes(n.parentId);
            })
            ?.map((n) => n.id) || [];
    return (summaryNodes || []).map((orig) => {
        const pathNode = selectedPathNodes.find((node) => node.id === getComparableNodeId(orig));
        const isPathNode = Boolean(pathNode);
        const isClusterInfoChild = selectedPathClusterInfoNodeIds.includes(orig.id);

        const opacity =
            isPathNode || isClusterInfoChild ? SELECTED_NODE_EDGE_OPACITY : DESELECTED_NODE_OPACITY;

        // If it’s a path node, merge its latest props; otherwise keep original
        const base = isPathNode ? { ...orig, ...pathNode } : { ...orig };

        return {
            ...base,
            style: {
                ...(base.style || {}),
                opacity,
            },
        };
    });
};

export const getEnrichedNodes = (
    _nodes: DiagramNode[] //
) => {
    return _nodes?.map((node) => {
        const icon_type = getIconType(node?.data?.class || "");
        return {
            ...node,
            data: {
                ...node?.data,
                icon: node?.data?.icon ?? icon_type, //
                label: node?.data?.label ?? icon_type,
            },
        };
    });
};

export const getSelectedViewNodes = (
    nodes: DiagramNode[], //
    canvas: DiagramCanvas[],
    getNodePropsFunc: (props: NodeVisibilityFuncProps) => Partial<DiagramNode> = () => {
        return {};
    },
    selectedCanvas?: DiagramCanvas,
    selectedCanvasViewOnly?: boolean,
    selectedPath?: AttackPath,
    viewAllPaths?: boolean
) => {
    return nodes?.map((node) => {
        const props: NodeVisibilityFuncProps = {
            node,
            canvas,
            selectedCanvasViewOnly,
        };
        if (selectedCanvas) props.selectedCanvas = selectedCanvas;
        if (selectedPath) props.selectedPath = selectedPath;
        if (viewAllPaths !== undefined) props.viewAllPaths = viewAllPaths;

        const {
            style: nodeProps__style = {}, //
            ...nodeProps
        } = getNodePropsFunc(props);

        return {
            ...node,
            ...nodeProps,
            style: {
                ...node?.style, //
                ...nodeProps__style,
            },
        };
    });
};

export const getArchitectureCanvasNodeProps = ({
    selectedCanvasViewOnly, //
    node,
}: NodeVisibilityFuncProps) => {
    if (
        node?.data?.type === CanvasNodeType.architecture.toString() //
    ) {
        return {
            connectable: !selectedCanvasViewOnly,
            deletable: !selectedCanvasViewOnly,
            draggable: !selectedCanvasViewOnly,
            selectable: !selectedCanvasViewOnly,
            style: {
                opacity: SELECTED_NODE_EDGE_OPACITY, //
            },
        };
    }
    return {
        selected: false,
        connectable: false,
        deletable: false,
        draggable: false,
        selectable: false,
        style: {
            opacity: DESELECTED_NODE_OPACITY, //
        },
    };
};

export const checkIfChildNodeWithinParentNode = ({
    parent_info,
    params,
}: {
    parent_info: NodeInfo;
    params: ResizeParams;
}) => {
    const parent_condition_checks = {
        bottom: parent_info.nodeY_top + params.y + params.height >= parent_info.nodeY_bottom,
        left: params.x <= 0,
        right: parent_info.nodeX_left + params.x + params.width >= parent_info.nodeX_right,
        top: params.y <= 0,
    };
    if (!!Object.values(parent_condition_checks)?.some((c) => !!c)) {
        throw new Error("Parent node bounds violated");
    }
};

export const checkResizeEndConditions = ({
    allNodes,
    node_id,
    params,
}: {
    allNodes: Node[];
    node_id: string;
    params: ResizeParams;
}) => {
    const node = allNodes.find((_node) => _node.id === node_id);
    if (!node) throw new Error("Node not found");

    const node_info = getNodeInfo({
        node,
        allNodes,
    });
    if (!node_info) throw new Error("Node info not found");

    const childNodes = allNodes?.filter((n) => n?.parentId === node.id && !n?.hidden);
    const childNodes_info = childNodes?.map((childNode) =>
        getNodeInfo({
            node: childNode,
            allNodes,
        })
    );

    if (node.parentId) {
        const parent_node = allNodes.find((_node) => _node?.id === node?.parentId);
        if (!parent_node) throw new Error("Parent node not found");

        const parent_info = getNodeInfo({
            node: parent_node,
            allNodes,
        });
        if (!parent_info) throw new Error("Parent node info not found");

        checkIfChildNodeWithinParentNode({ parent_info, params });

        childNodes_info?.forEach((childNode_info) => {
            if (!childNode_info) return;

            const child_condition_checks = {
                bottom:
                    parent_info.nodeY_top + params.y + params.height <= childNode_info.nodeY_bottom,
                left: parent_info.nodeX_left + params.x >= childNode_info.nodeX_left,
                right:
                    parent_info.nodeX_left + params.x + params.width <= childNode_info.nodeX_right,
                top: parent_info.nodeY_top + params.y >= childNode_info.nodeY_top,
            };

            if (!!Object.values(child_condition_checks)?.some((c) => !!c)) {
                throw new Error("Child node bounds violated");
            }
        });
    } else {
        childNodes_info?.forEach((childNode_info) => {
            if (!childNode_info) return;

            const child_condition_checks = {
                bottom: params.y + params.height <= childNode_info.nodeY_bottom,
                left: params.x >= childNode_info.nodeX_left,
                right: params.x + params.width <= childNode_info.nodeX_right,
                top: params.y >= childNode_info.nodeY_top,
            };

            if (!!Object.values(child_condition_checks)?.some((c) => !!c)) {
                throw new Error("Child node bounds violated");
            }
        });
    }
};

export const isChildNode = ({
    node,
    potentialParentId,
    allNodes,
}: {
    node: DiagramNode;
    potentialParentId: string;
    allNodes: DiagramNode[];
}) => {
    let parentId = node?.parentId;
    while (parentId) {
        if (parentId === potentialParentId) return true;
        const internalNode = allNodes?.find((n) => n?.id === parentId);
        parentId = internalNode?.parentId ?? "";
    }
    return false;
};

export const checkIfNodeCompletelyOutside = ({
    nodeA_info,
    nodeB_info,
}: {
    nodeA_info: NodeInfo;
    nodeB_info: NodeInfo;
}) => {
    return (
        nodeA_info.nodeX_right < nodeB_info.nodeX_left ||
        nodeA_info.nodeX_left > nodeB_info.nodeX_right ||
        nodeA_info.nodeY_bottom < nodeB_info.nodeY_top ||
        nodeA_info.nodeY_top > nodeB_info.nodeY_bottom
    );
};

export const checkIfNodeCompletelyInside = ({
    nodeA_info,
    nodeB_info,
}: {
    nodeA_info: NodeInfo;
    nodeB_info: NodeInfo;
}) => {
    return (
        nodeA_info.nodeX_left >= nodeB_info.nodeX_left &&
        nodeA_info.nodeY_top >= nodeB_info.nodeY_top &&
        nodeA_info.nodeX_right <= nodeB_info.nodeX_right &&
        nodeA_info.nodeY_bottom <= nodeB_info.nodeY_bottom
    );
};

const checkIfNodePartialOverlap = ({
    nodeA_info,
    nodeB_info,
}: {
    nodeA_info: NodeInfo;
    nodeB_info: NodeInfo;
}) => {
    const isCompletelyOutside = checkIfNodeCompletelyOutside({ nodeA_info, nodeB_info });
    const isCompletelyInside = checkIfNodeCompletelyInside({ nodeA_info, nodeB_info });

    if (!isCompletelyInside && !isCompletelyOutside) {
        return true;
    }
    return false;
};

export const checkIfNodeOverlap = ({
    allNodes,
    changedNode,
}: {
    allNodes: DiagramNode[];
    changedNode: DiagramNode;
}) => {
    const changedNodeInfo = getNodeInfo({
        node: changedNode,
        allNodes,
    });
    if (!changedNodeInfo) throw new Error("Node info not found.");

    for (const n of allNodes) {
        if (n?.id === changedNode?.id) continue;

        // Avoid treating parent-child containment as overlap
        if (
            changedNode?.type === CanvasNodeVariantType.clusterNode &&
            isChildNode({
                node: n,
                potentialParentId: changedNode?.id,
                allNodes,
            })
        ) {
            continue;
        }

        const nodeInfo = getNodeInfo({
            node: n,
            allNodes,
        });
        if (!nodeInfo) throw new Error("Node info not found.");

        if (
            checkIfNodePartialOverlap({
                nodeA_info: changedNodeInfo,
                nodeB_info: nodeInfo,
            })
        )
            throw new Error("Nodes are overlapped.");
    }
};

export const evalGetNodePropsFunc = (
    canvas_type?: string //
) => {
    switch (canvas_type) {
        case CanvasType.architecture:
            return getArchitectureCanvasNodeProps;
        default:
            return () => {
                return {};
            };
    }
};

export const getProcessedNodes = ({
    projectDiagram,
    canvasNodes,
    selectedCanvas,
    selectedCanvasViewOnly,
    //
    filterAuthorizedNodes,
    filterSelectedViewNodes,
    selectedPath,
    viewAllPaths,
    threatOverviewScenarioScope: _threatOverviewScenarioScope,
    visibleThreatScenarioCanvasIds: _visibleThreatScenarioCanvasIds,
}: {
    projectDiagram: ProjectDiagram;
    canvasNodes: DiagramNode[];
    selectedCanvas: DiagramCanvas;
    selectedCanvasViewOnly: boolean | undefined;
    //
    architectureNodes?: DiagramNode[];
    filterAuthorizedNodes?: boolean;
    filterSelectedViewNodes?: boolean;
    selectedPath?: AttackPath | undefined;
    viewAllPaths?: boolean;
    threatOverviewScenarioScope?: "top5" | "all";
    visibleThreatScenarioCanvasIds?: string[];
}) => {
    const getNodePropsFunc = evalGetNodePropsFunc(
        selectedCanvas.canvas_type //
    );

    let processed_nodes = [
        ...canvasNodes, //
    ] as DiagramNode[];

    // Temporarily keep non-canvas nodes out of the primary canvas state.
    // if (selectedCanvas.canvas_type !== CanvasType.architecture) {
    //     processed_nodes = [
    //         ...architectureNodes, //
    //         ...processed_nodes,
    //     ];
    // }

    const visibilityCanvas = projectDiagram.canvas;

    if (!!filterSelectedViewNodes) {
        processed_nodes = getSelectedViewNodes(
            processed_nodes, //
            visibilityCanvas,
            getNodePropsFunc,
            selectedCanvas,
            selectedCanvasViewOnly,
            selectedPath,
            viewAllPaths
        );
    }
    if (!!filterAuthorizedNodes) {
        processed_nodes = getEnrichedNodes(
            processed_nodes //
        );
    }
    return processed_nodes;
};

export const checkNodeDeletable = ({
    node, //
    selectedCanvas,
    allowDeleteNodeInAnyCanvas = false,
}: {
    node: DiagramNode;
    selectedCanvas: DiagramCanvas;
    allowDeleteNodeInAnyCanvas?: boolean;
}) => {
    if (selectedCanvas.canvas_type !== node?.data?.type && !allowDeleteNodeInAnyCanvas) {
        throw new Error("This node can only be modified in its original canvas.");
    }
    if (
        !![
            CanvasNodeVariantType.infoNode.toString(), //
            CanvasNodeVariantType.clusterNode.toString(),
        ].includes(node.type || "") &&
        !node?.deletable
    ) {
        throw new Error(
            "This node is set to be non-deletable." //
        );
    }
    return true;
};

export const updateAllChildNodesRecursive = ({
    node_id,
    nodes,
    childNodes,
}: {
    node_id: string;
    nodes: DiagramNode[];
    childNodes: DiagramNode[];
}) => {
    const _childNodes = nodes.filter((n) => n.parentId === node_id && !n.hidden) || [];
    childNodes.push(..._childNodes);
    _childNodes.forEach((n) => {
        updateAllChildNodesRecursive({
            node_id: n.id,
            nodes,
            childNodes,
        });
    });
};

export const getAllChildNodes = ({ node_id, nodes }: { node_id: string; nodes: DiagramNode[] }) => {
    const childNodes = [] as DiagramNode[];
    updateAllChildNodesRecursive({
        node_id,
        nodes,
        childNodes,
    });
    return childNodes;
};

export const checkIfNodeCanBeDeleted = ({
    allowDeleteNodeInAnyCanvas = false,
    node,
    nodes,
    selectedCanvas,
    selectedNodeIdList,
}: {
    allowDeleteNodeInAnyCanvas?: boolean;
    node: DiagramNode; //
    nodes: DiagramNode[];
    selectedCanvas: DiagramCanvas;
    selectedNodeIdList: string[];
}) => {
    const node_id = node.id;
    checkNodeDeletable({
        node, //
        selectedCanvas,
        allowDeleteNodeInAnyCanvas,
    });

    const childNodes = getAllChildNodes({
        node_id,
        nodes,
    });
    const isAllChildNodesToBeDeleted = !!childNodes?.every((n) => {
        return !!selectedNodeIdList?.includes(n.id);
    });
    if (!isAllChildNodesToBeDeleted) {
        throw new Error("Existing child node(s) found.");
    }

    return true;
};

export const getPositionFromHandleId = (handleId: string) => {
    if (!handleId) return Position.Bottom;
    const handlePosition = handleId.split("_").slice(-1)[0];
    return handlePosition as Position;
};

export const checkOutdatedNodeKey = (
    n: DiagramNode, //
    iconKey: string
) => {
    if (!iconKey) return false;
    if (!Object.keys(NodeIconKey)?.includes(iconKey)) {
        const _mappedKey =
            NodeIconKeyBridgeMapping?.[iconKey as keyof typeof NodeIconKeyBridgeMapping] || "";
        n.data.icon = `${_mappedKey}`;
        return true;
    }
    return false;
};

export const checkCardNodeIcon = (
    n: DiagramNode, //
    iconKey: string
) => {
    if (!iconKey) return false;
    const cardRefKey = n?.data?.cardRefKey || "";
    const _cardRefKey =
        UserStoryCardIconMapping[cardRefKey as keyof typeof UserStoryCardIconMapping];
    if (!!cardRefKey && iconKey !== _cardRefKey) {
        n.data.icon = _cardRefKey;
        return true;
    }
    return false;
};

export const patchCanvasListWithUpdatedIcons = (
    canvas: DiagramCanvas[], //
    updateDB: boolean
) => {
    canvas.forEach((c) => {
        const _nodes =
            c?.nodes?.map((n) => {
                const iconKey = (n?.data?.icon as string) || "";
                if (!iconKey) return n;

                /**
                 * Updates the `updateDB` flag based on the results of `checkOutdatedNodeKey` and `checkCardNodeIcon` functions.
                 *
                 * This code snippet checks if the node's key or icon is outdated or needs to be updated by calling the
                 * `checkOutdatedNodeKey` and `checkCardNodeIcon` functions. If either function returns `true`, indicating
                 * that an update is needed, the `updateDB` flag is set to `true`.
                 */
                const _updateDB = checkOutdatedNodeKey(n, iconKey);
                const __updateDB = checkCardNodeIcon(n, iconKey);
                updateDB = updateDB || __updateDB || _updateDB;
                return n;
            }) || [];
        c.nodes = _nodes;
    });
};

export const getInitializedDiagramNode = (
    node: DiagramNode //
) => {
    const {
        data: default_node_data = {}, //
        style: default_node_style = {},
        ...defaultNodeProps
    } = default_node;
    const {
        data: node_data = {}, //
        style: node_style = {},
        ...nodeProps
    } = node;
    return {
        ...defaultNodeProps, //
        ...nodeProps,
        style: {
            ...default_node_style, //
            ...node_style,
        },
        data: {
            ...default_node_data, //
            ...node_data,
        },
    };
};

export const getInitializedDiagramNodes = (
    nodes: DiagramNode[] //
) => {
    return (
        nodes?.map((node) => {
            return getInitializedDiagramNode(node);
        }) || []
    );
};

export const getNodeArrayIndex = (
    node: DiagramNode, //
    nodes: DiagramNode[] //
) => {
    return nodes.findIndex((n) => n.id === node.id);
};

export const moveNodeInPlace = ({
    nodes,
    fromIndex,
    toIndex,
}: {
    nodes: DiagramNode[]; //
    fromIndex: number;
    toIndex: number;
}) => {
    if (fromIndex === toIndex) return;
    const [moved] = nodes.splice(fromIndex, 1);
    if (moved) {
        nodes.splice(toIndex, 0, moved);
    }
};

export const getInterfaceNodeId = (deviceNodeId: string, interfaceCardFieldOptionId: string) => {
    if (!deviceNodeId || !interfaceCardFieldOptionId) {
        throw new Error("Device node ID and interface card field option ID are required.");
    }
    return `${deviceNodeId}__${interfaceCardFieldOptionId}`;
};
