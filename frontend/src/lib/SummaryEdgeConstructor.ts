import {
    CanvasEdgeType,
    DiagramEdge,
    DiagramNode,
    EdgeHandleMapping,
    ProjectDiagram,
    SummaryCanvasColumn,
} from "#root/interfaces/diagram";
import { UuidIdentifierKey } from "#root/interfaces/identifier";
import { generateUUID } from "#root/utils/identifierUtil";

import { SummaryEdgeHandleResolver } from "./SummaryEdgeHandleResolver";

const getOriginalNodeId = (node?: DiagramNode) => {
    return `${node?.data?.["originalNodeId"] || node?.id || ""}`;
};

export class SummaryEdgeConstructor {
    projectDiagram: ProjectDiagram;
    allNodes: DiagramNode[];
    summaryNodes: DiagramNode[];
    nodeColumnMapping: {
        [x: string]: SummaryCanvasColumn;
    };

    constructor({
        projectDiagram, //
        summaryNodes,
        nodeColumnMapping,
    }: {
        projectDiagram: ProjectDiagram;
        summaryNodes: DiagramNode[];
        nodeColumnMapping: {
            [x: string]: SummaryCanvasColumn;
        };
    }) {
        this.projectDiagram = projectDiagram;
        this.summaryNodes = summaryNodes;
        this.nodeColumnMapping = nodeColumnMapping;
        //
        this.allNodes = projectDiagram.canvas.flatMap((c) => c.nodes) || [];
    }

    getUniqueEdges({
        edges, //
        edgeHandleMapping,
    }: {
        edges: DiagramEdge[];
        edgeHandleMapping: EdgeHandleMapping;
    }) {
        const uniqueEdges = [] as DiagramEdge[];
        const seenEdgeKeys = new Set<string>();
        edges.forEach((edge) => {
            const originalSourceNode = this.allNodes?.find((n) => n.id === edge.source);
            const originalTargetNode = this.allNodes?.find((n) => n.id === edge.target);
            let sourceNode = originalSourceNode;
            let targetNode = originalTargetNode;

            if (!sourceNode || !targetNode) {
                throw new Error("Node not found while constructing summary canvas edge.");
            }

            if (sourceNode.data.type === CanvasEdgeType.data_flow.toString()) {
                sourceNode = this.summaryNodes.find((n) => {
                    return (
                        getOriginalNodeId(n) === sourceNode?.id ||
                        (n.data.cardFieldOptionId === sourceNode?.data?.cardFieldOptionId &&
                            n.data.cardFieldOptionIdAssoc ===
                                sourceNode?.data?.cardFieldOptionIdAssoc)
                    );
                });
                if (!sourceNode) {
                    throw new Error("Source node not found.");
                }
            }
            if (targetNode.data.type === CanvasEdgeType.data_flow.toString()) {
                targetNode = this.summaryNodes?.find((n) => {
                    return (
                        getOriginalNodeId(n) === targetNode?.id ||
                        (n.data.cardFieldOptionId === targetNode?.data?.cardFieldOptionId &&
                            n.data.cardFieldOptionIdAssoc ===
                                targetNode?.data?.cardFieldOptionIdAssoc)
                    );
                });
                if (!targetNode) {
                    throw new Error("Target node not found.");
                }
            }

            if (!this.nodeColumnMapping) {
                throw new Error("Node column mapping is not defined.");
            }
            const edgeHandleResolver = new SummaryEdgeHandleResolver({
                projectDiagram: this.projectDiagram,
                allNodes: [...this.allNodes, ...this.summaryNodes],
                nodeColumnMapping: this.nodeColumnMapping,
                edgeHandleMapping,
            });
            const {
                sourceHandle, //
                targetHandle,
            } = edgeHandleResolver.getEdgeHandles({
                sourceNode, //
                targetNode,
                edge,
            });
            const _edge = {
                ...edge,
                id: generateUUID(UuidIdentifierKey.diagramEdge),
                source: sourceNode.id,
                target: targetNode.id,
                sourceHandle: sourceHandle || null,
                targetHandle: targetHandle || null,
                data: {
                    ...(edge.data || {}),
                    originalEdgeId: edge.id,
                    originalSourceId: edge.source,
                    originalTargetId: edge.target,
                },
            };

            const edgeKey = [
                _edge.source,
                _edge.sourceHandle || "",
                _edge.target,
                _edge.targetHandle || "",
                _edge.type || "",
                _edge.data?.type || "",
            ].join("|");

            if (seenEdgeKeys.has(edgeKey)) {
                return;
            }

            seenEdgeKeys.add(edgeKey);
            uniqueEdges.push(_edge);
        });

        return { edges: uniqueEdges };
    }
}
