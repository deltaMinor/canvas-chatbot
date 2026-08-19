import {
    DiagramEdge,
    DiagramNode,
    EdgeHandleType,
    NodeHandleEdgeMapping,
    NodeHandleEdgeMappingDict,
} from "#root/interfaces/diagram";
import {
    getDiagramDraftCanvasEdgesFromStore,
    getDiagramDraftCanvasNodesFromStore,
    getDiagramNodeHandleEdgeMappingFromStore,
    getDiagramOverlayEdgesFromStore,
    getDiagramOverlayNodesFromStore,
    setDiagramNodeHandleEdgeMapping,
} from "#root/stores/projectDiagram/canvas";
import { getOverlappingEdgesInOrder } from "#root/utils/diagram/diagramEdgeUtil";

const areStringArraysEqual = (left: string[], right: string[]) => {
    if (left.length !== right.length) {
        return false;
    }

    return left.every((value, index) => value === right[index]);
};

const isNodeHandleEdgeMappingEqual = (
    left: NodeHandleEdgeMappingDict,
    right: NodeHandleEdgeMappingDict
) => {
    const leftNodeIds = Object.keys(left);
    const rightNodeIds = Object.keys(right);

    if (!areStringArraysEqual(leftNodeIds, rightNodeIds)) {
        return false;
    }

    return leftNodeIds.every((nodeId) => {
        const leftMapping = left[nodeId];
        const rightMapping = right[nodeId];

        if (!leftMapping || !rightMapping || leftMapping.node_id !== rightMapping.node_id) {
            return false;
        }

        const leftHandleTypes = Object.keys(leftMapping.handles);
        const rightHandleTypes = Object.keys(rightMapping.handles);

        if (!areStringArraysEqual(leftHandleTypes, rightHandleTypes)) {
            return false;
        }

        return leftHandleTypes.every((handleType) =>
            areStringArraysEqual(
                leftMapping.handles[handleType] ?? [],
                rightMapping.handles[handleType] ?? []
            )
        );
    });
};

export class NodeHandleEdgeMappingResolver {
    constructor(private readonly instanceId: string) {}

    get({
        nodes,
        edges,
    }: {
        nodes: DiagramNode[];
        edges: DiagramEdge[];
    }): NodeHandleEdgeMappingDict {
        const handleTypes = Object.keys(EdgeHandleType || {});
        const nodeHandleEdgeMapping: NodeHandleEdgeMappingDict = {};

        nodes.forEach((node) => {
            const currentNodeHandleEdgeMapping: NodeHandleEdgeMapping = {
                node_id: node.id,
                handles: {},
            };

            handleTypes.forEach((handleType) => {
                if (!edges?.length) {
                    currentNodeHandleEdgeMapping.handles[handleType] = [];
                    return;
                }

                const overlappingEdges = getOverlappingEdgesInOrder({
                    edges,
                    allNodes: nodes,
                    refNodeId: node.id,
                    refNodehandle: handleType,
                });
                currentNodeHandleEdgeMapping.handles[handleType] = overlappingEdges.map(
                    (edge) => edge.id
                );
            });

            nodeHandleEdgeMapping[node.id] = currentNodeHandleEdgeMapping;
        });

        return nodeHandleEdgeMapping;
    }

    refresh({
        nodes,
        edges,
    }: {
        nodes?: DiagramNode[];
        edges?: DiagramEdge[];
    } = {}): NodeHandleEdgeMappingDict {
        const contextNodes = getDiagramDraftCanvasNodesFromStore(this.instanceId);
        const contextEdges = getDiagramDraftCanvasEdgesFromStore(this.instanceId);
        const currentNodeHandleEdgeMapping = getDiagramNodeHandleEdgeMappingFromStore(
            this.instanceId
        );
        const contextOverlayNodes = getDiagramOverlayNodesFromStore(this.instanceId);
        const contextOverlayEdges = getDiagramOverlayEdgesFromStore(this.instanceId);

        const baseNodes = nodes ?? contextNodes;
        const baseEdges = edges ?? contextEdges;
        const mergedNodes = [
            ...baseNodes,
            ...contextOverlayNodes.filter(
                (overlayNode) => !baseNodes.some((node) => node.id === overlayNode.id)
            ),
        ];
        const mergedEdges = [
            ...baseEdges,
            ...contextOverlayEdges.filter(
                (overlayEdge) => !baseEdges.some((edge) => edge.id === overlayEdge.id)
            ),
        ];

        const nodeHandleEdgeMapping = this.get({
            nodes: mergedNodes,
            edges: mergedEdges,
        });

        if (isNodeHandleEdgeMappingEqual(currentNodeHandleEdgeMapping, nodeHandleEdgeMapping)) {
            return currentNodeHandleEdgeMapping;
        }

        setDiagramNodeHandleEdgeMapping(nodeHandleEdgeMapping, this.instanceId);
        return nodeHandleEdgeMapping;
    }
}
