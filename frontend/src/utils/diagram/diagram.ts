import {
    HORIZONTAL_PASTE_OFFSET,
    VERTICAL_PASTE_OFFSET,
    default_canvas,
} from "#root/constants/diagram";
import {
    CanvasNodeVariantType,
    CanvasType,
    DiagramCanvas,
    DiagramEdge,
    DiagramNode,
    ProjectDiagram,
} from "#root/interfaces/diagram";
import { UuidIdentifierKey } from "#root/interfaces/identifier";

import { getNodeInfo } from "../diagramUtil";
import { generateUUID } from "../identifierUtil";

import { getSelectedCanvasFromId, updateCanvasViewOnly } from "./diagramCanvasUtil";
import { checkIfEdgeCanBeDeleted, getInitializedDiagramEdges } from "./diagramEdgeUtil";
import {
    checkIfChildNodeWithinParentNode,
    checkIfNodeCanBeDeleted,
    checkIfNodeCompletelyInside,
    checkIfNodeCompletelyOutside,
    getInitializedDiagramNodes,
    isChildNode,
    patchCanvasListWithUpdatedIcons,
} from "./diagramNodeUtil";

export const getInitializedCanvasNodesAndEdges = (canvas: DiagramCanvas) => {
    if (!Object.keys(canvas).length) return canvas;
    const nodes = getInitializedDiagramNodes([...(canvas?.nodes || [])]);
    const edges = getInitializedDiagramEdges([...(canvas?.edges || [])]);
    return {
        nodes: nodes,
        edges: edges,
    };
};

export const getProcessedProjectDiagram = (
    projectDiagram: ProjectDiagram, //
    updateDB: boolean
) => {
    const processedProjectDiagram = structuredClone(projectDiagram);

    let canvas = processedProjectDiagram?.canvas || [];
    if (!processedProjectDiagram?.canvas?.length) {
        canvas = [...default_canvas];
        updateDB = true;
    }

    // Initialize canvas
    canvas.forEach((c) => {
        if (c?.canvas_type !== CanvasType.architecture) return;
        const {
            nodes, //
            edges,
        } = getInitializedCanvasNodesAndEdges(c);
        c.nodes = nodes;
        c.edges = edges as DiagramEdge[];
    });

    // Get patched canvas list with updated icons
    patchCanvasListWithUpdatedIcons(
        canvas, //
        updateDB
    );

    processedProjectDiagram.canvas = canvas;
    return processedProjectDiagram;
};

export const getFilteredCanvasNodesOrEdges = <T extends { data?: { type?: string } }>(
    elements: T[],
    canvas_type?: CanvasType
): T[] => {
    if (!canvas_type) return [];
    return (
        elements?.filter((n) => {
            return n?.data?.type === canvas_type;
        }) || []
    );
};

const initializeClusterNodePastePosition = ({
    allNodes,
    node,
}: {
    allNodes: DiagramNode[];
    node: DiagramNode;
}) => {
    if (node?.type !== CanvasNodeVariantType?.clusterNode) return;

    // Cluster node is placed outside of its parent node
    if (node?.parentId) {
        const parent_node = allNodes.find((_node) => _node?.id === node?.parentId);
        if (!parent_node) throw new Error("Parent node not found");

        node.position.x = parent_node?.position?.x ?? 0;
        node.position.y =
            (parent_node?.position?.y ?? 0) +
            (parent_node?.height ?? Number(parent_node?.style?.height));
    }
    // Remove parentId to get actual absolute position
    node.parentId = "";
};

const checkIfInfoNodePositionWithinParent = ({
    allNodes,
    node,
}: {
    allNodes: DiagramNode[];
    node: DiagramNode;
}) => {
    if (node?.type !== CanvasNodeVariantType?.infoNode) return;

    // Check if info node is still within the parent node if it is copied without copying parent node
    if (node?.parentId) {
        const parent_node = allNodes.find((_node) => _node?.id === node?.parentId);
        if (!parent_node) throw new Error("Parent node not found");

        const parent_info = getNodeInfo({
            node: parent_node,
            allNodes,
        });
        if (!parent_info) throw new Error("Node info not found.");

        checkIfChildNodeWithinParentNode({
            parent_info,
            params: {
                x: node?.position?.x,
                y: node?.position?.y,
                width: node?.width ?? Number(node?.style?.width),
                height: node?.height ?? Number(node?.style?.height),
            },
        });
    }
};

const findClusterNodePastePosition = ({
    allNodes,
    node,
}: {
    allNodes: DiagramNode[];
    node: DiagramNode;
}) => {
    if (node?.type !== CanvasNodeVariantType.clusterNode) return;

    initializeClusterNodePastePosition({ allNodes, node });

    let overlapped = true;
    while (overlapped) {
        node.position.y += VERTICAL_PASTE_OFFSET;

        const newNodeInfo = getNodeInfo({
            node,
            allNodes,
        });
        if (!newNodeInfo) throw new Error("Node info not found.");

        overlapped = false;
        for (const n of allNodes) {
            if (n?.id === node?.id) continue;

            // Avoid treating parent-child containment as overlap
            if (
                n?.type === CanvasNodeVariantType.clusterNode &&
                isChildNode({
                    node,
                    potentialParentId: n?.id,
                    allNodes,
                })
            )
                continue;

            const nodeInfo = getNodeInfo({
                node: n,
                allNodes,
            });
            if (!nodeInfo) throw new Error("Node info not found.");

            if (
                !checkIfNodeCompletelyOutside({
                    nodeA_info: newNodeInfo,
                    nodeB_info: nodeInfo,
                })
            ) {
                overlapped = true;
                break;
            }
        }
    }
};

const findInfoNodePastePosition = ({
    allNodes,
    node,
}: {
    allNodes: DiagramNode[];
    node: DiagramNode;
}) => {
    if (node?.type !== CanvasNodeVariantType.infoNode) return;

    let overlapped = true;
    while (overlapped) {
        node.position.x += HORIZONTAL_PASTE_OFFSET;
        node.position.y += VERTICAL_PASTE_OFFSET;

        const newNodeInfo = getNodeInfo({
            node,
            allNodes,
        });
        if (!newNodeInfo) throw new Error("Node info not found.");

        checkIfInfoNodePositionWithinParent({ allNodes, node });

        overlapped = false;
        for (const n of allNodes) {
            if (n?.id === node?.id) continue;

            // Avoid treating parent-child containment as overlap
            if (
                n?.type === CanvasNodeVariantType.clusterNode &&
                isChildNode({
                    node,
                    potentialParentId: n?.id,
                    allNodes,
                })
            )
                continue;

            const nodeInfo = getNodeInfo({
                node: n,
                allNodes,
            });
            if (!nodeInfo) throw new Error("Node info not found.");

            if (
                checkIfNodeCompletelyInside({
                    nodeA_info: newNodeInfo,
                    nodeB_info: nodeInfo,
                })
            ) {
                overlapped = true;
                break;
            }
        }
    }
};

export const findAvailablePastePosition = ({
    allNodes,
    node,
    preservePosition,
}: {
    allNodes: DiagramNode[];
    node: DiagramNode;
    preservePosition: boolean;
}) => {
    if (preservePosition) return;

    if (node?.type === CanvasNodeVariantType.infoNode)
        findInfoNodePastePosition({
            allNodes,
            node, //
        });
    else
        findClusterNodePastePosition({
            allNodes,
            node, //
        });
};

export const getUpdatedNodesAndEdgesAfterPasteOp = ({
    allNodes,
    canvasEdges,
    canvasNodes,
    clipboard,
    selectedCanvasType,
}: {
    allNodes: DiagramNode[];
    canvasNodes: DiagramNode[];
    canvasEdges: DiagramEdge[];
    clipboard: {
        nodes: DiagramNode[];
        edges: DiagramEdge[];
    };
    selectedCanvasType?: DiagramCanvas["canvas_type"] | undefined;
}) => {
    if (!selectedCanvasType) {
        throw new Error("Canvas type is undefined.");
    }
    if (selectedCanvasType !== CanvasType.architecture) {
        throw new Error(
            `Paste action can only be performed while in the
            architecture canvas.`
        );
    }

    // To store new node.id that corresponds to its prev node.id
    const nodeIdMap = new Map<string, string>();

    // Generate node.id for each new node
    clipboard.nodes.forEach((n) => {
        return nodeIdMap.set(n?.id, generateUUID(UuidIdentifierKey.diagramNode));
    });

    // Generate new Nodes
    const newNodes =
        clipboard.nodes?.map((n) => {
            // Preserve child node position if parent node is copied as well
            let preservePosition = false;
            if (nodeIdMap.has(n?.parentId ?? "")) preservePosition = true;

            const node = structuredClone({
                ...n,
                id: nodeIdMap.get(n?.id) || "",
                parentId: (nodeIdMap.get(n?.parentId ?? "") || n?.parentId) ?? "",
                selected: true,
            });
            findAvailablePastePosition({
                allNodes,
                node, //
                preservePosition,
            });
            return node;
        }) || [];

    // Generate new Edges
    const newEdges =
        clipboard.edges?.map((e) => ({
            ...e,
            id: generateUUID(UuidIdentifierKey.diagramEdge),
            selected: true,
            source: nodeIdMap.get(e.source) || "",
            target: nodeIdMap.get(e.target) || "",
        })) || [];

    const deselectedCanvasNodes = canvasNodes.map((node) => ({
        ...node,
        selected: false,
    }));
    const deselectedCanvasEdges = canvasEdges.map((edge) => ({
        ...edge,
        selected: false,
    }));

    return {
        canvasNodes: [
            ...deselectedCanvasNodes, //
            ...newNodes,
        ],
        canvasEdges: [
            ...deselectedCanvasEdges, //
            ...newEdges,
        ],
    };
};

export const getUpdatedDiagramPostDeleteNodesOps = ({
    projectDiagram,
    context__nodes,
    context__edges,
    selectedCanvas,
    selectedCanvasType,
    resetOverlappingLineSegments,
    selectedNodeIdList = [],
    selectedEdgeIdList = [],
    allowDeleteNodeInAnyCanvas = false,
    allowDeleteEdgeInAnyCanvas = false,
}: {
    projectDiagram: ProjectDiagram;
    context__nodes: DiagramNode[];
    context__edges: DiagramEdge[];
    selectedCanvas: DiagramCanvas;
    selectedCanvasType?: DiagramCanvas["canvas_type"] | undefined;
    resetOverlappingLineSegments: (visibleEdges: DiagramEdge[], edge: DiagramEdge) => void;
    selectedNodeIdList?: string[];
    selectedEdgeIdList?: string[];
    allowDeleteNodeInAnyCanvas?: boolean;
    allowDeleteEdgeInAnyCanvas?: boolean;
}) => {
    if (!selectedCanvasType) return projectDiagram;

    const canvas = structuredClone(projectDiagram.canvas);
    const selectedNodeIdSet = new Set(selectedNodeIdList);
    const connectedEdgeIdSet = new Set(
        canvas
            .flatMap((c) => c.edges ?? [])
            .filter(
                (edge) => selectedNodeIdSet.has(edge.source) || selectedNodeIdSet.has(edge.target)
            )
            .map((edge) => edge.id)
    );
    const effectiveSelectedEdgeIdList = Array.from(
        new Set([
            ...selectedEdgeIdList, //
            ...connectedEdgeIdSet,
        ])
    );

    canvas.forEach((c) => {
        if (c.canvas_id !== selectedCanvas.canvas_id) return;
        if (
            c.canvas_type === CanvasType.architecture.toString() //
        ) {
            const targetNodes =
                c?.nodes?.filter((n) => {
                    return !!selectedNodeIdList?.includes(n.id);
                }) || [];
            targetNodes.forEach((targetNode) => {
                checkIfNodeCanBeDeleted({
                    allowDeleteNodeInAnyCanvas,
                    node: targetNode, //
                    nodes: context__nodes,
                    selectedCanvas,
                    selectedNodeIdList,
                });
            });
            c.nodes = c.nodes.filter((n) => !selectedNodeIdList?.includes(n.id));
        }
    });

    const allNodeIdList = canvas?.flatMap((c) => c.nodes.map((n) => n.id));
    canvas.forEach((c) => {
        const targetEdges =
            c?.edges?.filter((e) => {
                return !!effectiveSelectedEdgeIdList?.includes(e.id);
            }) || [];
        targetEdges.forEach((targetEdge) => {
            checkIfEdgeCanBeDeleted({
                allowDeleteEdgeInAnyCanvas:
                    allowDeleteEdgeInAnyCanvas || connectedEdgeIdSet.has(targetEdge.id),
                selectedCanvasType,
                edge: targetEdge, //
            });
        });

        const visibleEdges =
            context__edges.filter((e) => {
                return !effectiveSelectedEdgeIdList?.includes(e.id);
            }) || [];
        targetEdges.forEach((e) => {
            resetOverlappingLineSegments(visibleEdges, e);
        });

        c.edges = c.edges.filter((e) => {
            return (
                !selectedNodeIdList.includes(e.target) && //
                !selectedNodeIdList.includes(e.source) &&
                !effectiveSelectedEdgeIdList.includes(e.id) &&
                !!allNodeIdList.includes(e.target) &&
                !!allNodeIdList.includes(e.source)
            );
        });
    });

    const updatedProjectDiagram = {
        ...projectDiagram,
        canvas: canvas,
    };
    return updatedProjectDiagram;
};

export const processDeleteAllNodesAndEdges = async ({
    projectDiagram,
    updateProjectDiagram,
    selectedCanvasId,
    handleSetProcessedNodesAndEdges,
    context__nodes,
    context__edges,
    selectedCanvas,
    selectedCanvasType,
    resetOverlappingLineSegments,
    selectedNodeIdList = [],
    selectedEdgeIdList = [],
}: {
    projectDiagram: ProjectDiagram;
    updateProjectDiagram: (params: { canvas: DiagramCanvas[] }) => Promise<void>;
    selectedCanvasId: string;
    handleSetProcessedNodesAndEdges: (params: {
        canvasEdges: DiagramEdge[];
        canvasNodes: DiagramNode[];
        funcRef: string;
    }) => Promise<void>;
    context__nodes: DiagramNode[];
    context__edges: DiagramEdge[];
    selectedCanvas: DiagramCanvas;
    selectedCanvasType?: DiagramCanvas["canvas_type"] | undefined;
    resetOverlappingLineSegments: (visibleEdges: DiagramEdge[], edge: DiagramEdge) => void;
    selectedNodeIdList?: string[];
    selectedEdgeIdList?: string[];
}) => {
    if (!selectedCanvasType) return;

    const updatedProjectDiagram = getUpdatedDiagramPostDeleteNodesOps({
        projectDiagram,
        context__nodes,
        context__edges,
        selectedCanvas,
        selectedCanvasType,
        resetOverlappingLineSegments,
        selectedNodeIdList,
        selectedEdgeIdList,
        allowDeleteNodeInAnyCanvas: true,
        allowDeleteEdgeInAnyCanvas: true,
    });
    const updatedSelectedCanvas = getSelectedCanvasFromId({
        projectDiagram: updatedProjectDiagram,
        draftCanvasId: selectedCanvasId,
    });
    if (!updatedSelectedCanvas) throw new Error("Canvas not found.");

    const updateProjectDiagramPromise = updateProjectDiagram({
        canvas: updatedProjectDiagram.canvas, //
    });
    await handleSetProcessedNodesAndEdges({
        canvasEdges: updatedSelectedCanvas.edges, //
        canvasNodes: updatedSelectedCanvas.nodes, //
        funcRef: "processConfirmDeleteAllSelectedEdges",
    });
    await updateProjectDiagramPromise;
};

export const processDeleteCanvasNodesAndEdges = async ({
    projectDiagram,
    updateCanvas,
    updateProjectDiagram,
    selectedCanvasId,
    handleSetProcessedNodesAndEdges,
    context__nodes,
    context__edges,
    selectedCanvas,
    selectedCanvasType,
    resetOverlappingLineSegments,
    selectedNodeIdList = [],
    selectedEdgeIdList = [],
}: {
    projectDiagram: ProjectDiagram;
    updateCanvas: (params: {
        canvasEdges: DiagramEdge[];
        canvasNodes: DiagramNode[];
        draftCanvasId?: string;
        funcRef: string;
    }) => DiagramCanvas | null | void | Promise<DiagramCanvas | null | void>;
    updateProjectDiagram?: (params: { canvas: DiagramCanvas[] }) => void | Promise<void>;
    selectedCanvasId?: string;
    handleSetProcessedNodesAndEdges: (params: {
        canvasEdges: DiagramEdge[];
        canvasNodes: DiagramNode[];
        funcRef: string;
    }) => void | Promise<void>;
    context__nodes: DiagramNode[];
    context__edges: DiagramEdge[];
    selectedCanvas: DiagramCanvas;
    selectedCanvasType?: DiagramCanvas["canvas_type"] | undefined;
    resetOverlappingLineSegments: (visibleEdges: DiagramEdge[], edge: DiagramEdge) => void;
    selectedNodeIdList?: string[];
    selectedEdgeIdList?: string[];
}) => {
    const resolvedSelectedCanvasType = selectedCanvasType ?? selectedCanvas.canvas_type;
    const resolvedSelectedCanvasId = selectedCanvasId || selectedCanvas.canvas_id;

    let updatedProjectDiagram = getUpdatedDiagramPostDeleteNodesOps({
        projectDiagram,
        context__nodes,
        context__edges,
        selectedCanvas,
        selectedCanvasType: resolvedSelectedCanvasType,
        resetOverlappingLineSegments,
        selectedNodeIdList,
        selectedEdgeIdList,
    });

    const updatedSelectedCanvas = getSelectedCanvasFromId({
        projectDiagram: updatedProjectDiagram,
        draftCanvasId: resolvedSelectedCanvasId,
    });
    if (!updatedSelectedCanvas) throw new Error("Canvas not found.");

    if (selectedNodeIdList.length > 0) {
        await updateProjectDiagram?.({
            canvas: updatedProjectDiagram.canvas,
        });
    }

    const persistedSelectedCanvas =
        (await updateCanvas({
            canvasEdges: updatedSelectedCanvas.edges, //
            canvasNodes: updatedSelectedCanvas.nodes, //
            draftCanvasId: resolvedSelectedCanvasId,
            funcRef: "processDeleteCanvasNodesAndEdges",
        })) ?? updatedSelectedCanvas;

    await handleSetProcessedNodesAndEdges({
        canvasEdges: persistedSelectedCanvas.edges, //
        canvasNodes: persistedSelectedCanvas.nodes, //
        funcRef: "processDeleteCanvasNodesAndEdges",
    });

    return updatedProjectDiagram;
};

export const processProjectDiagram = ({ projectDiagram }: { projectDiagram: ProjectDiagram }) => {
    const clonedProjectDiagram = structuredClone(projectDiagram);

    const updateDB = false;
    const updatedProjectDiagram = getProcessedProjectDiagram(
        clonedProjectDiagram, //
        updateDB
    );

    updatedProjectDiagram.canvas.forEach((c) => {
        c.nodes.forEach((n) => {
            n.selected = false;
            n.width = Number(n?.width || n?.style?.width);
            n.height = Number(n?.height || n?.style?.height);
            n.extent = n.extent || [
                [-Infinity, -Infinity],
                [Infinity, Infinity],
            ];
        });
        c.edges.forEach((e) => {
            e.selected = false;
        });
    });

    updateCanvasViewOnly(updatedProjectDiagram);
    return updatedProjectDiagram;
};
