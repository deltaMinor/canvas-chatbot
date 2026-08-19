import { UserStoryCardRefEnum } from "#root/enums/diagram";
import {
    DiagramEdge,
    DiagramNode,
    EdgeHandleMapping,
    ProjectDiagram,
    SummaryCanvasColumn,
} from "#root/interfaces/diagram";
import { getNodePositionAbsolute } from "#root/utils/diagram/diagramNodePositionUtil";

export class SummaryEdgeHandleResolver {
    projectDiagram: ProjectDiagram;
    allNodes: DiagramNode[];
    edgeHandleMapping: EdgeHandleMapping;
    nodeColumnMapping: {
        [x: string]: SummaryCanvasColumn;
    } | null;

    constructor({
        projectDiagram,
        allNodes,
        nodeColumnMapping,
        edgeHandleMapping,
    }: {
        projectDiagram: ProjectDiagram;
        allNodes: DiagramNode[];
        nodeColumnMapping: {
            [x: string]: SummaryCanvasColumn;
        };
        edgeHandleMapping: EdgeHandleMapping;
    }) {
        this.projectDiagram = projectDiagram;
        this.edgeHandleMapping = edgeHandleMapping;
        this.nodeColumnMapping = nodeColumnMapping;
        this.allNodes = allNodes;
    }

    getEdgeHandles({
        sourceNode,
        targetNode,
        edge,
    }: {
        sourceNode: DiagramNode; //
        targetNode: DiagramNode;
        edge: DiagramEdge;
    }) {
        if (!targetNode?.data?.cardRefKey && !sourceNode?.data?.cardRefKey) {
            return {
                sourceHandle: edge.sourceHandle,
                targetHandle: edge.targetHandle,
            };
        }

        const edgeHandleMapping = this.edgeHandleMapping;
        const sourceColumn = this.nodeColumnMapping?.[sourceNode?.id];
        const targetColumn = this.nodeColumnMapping?.[targetNode?.id];
        const sourcePositionAbsolute = getNodePositionAbsolute({
            node: sourceNode, //
            allNodes: this.allNodes,
        });
        const targetPositionAbsolute = getNodePositionAbsolute({
            node: targetNode, //
            allNodes: this.allNodes,
        });
        if (sourceNode?.data?.cardRefKey === UserStoryCardRefEnum.card_users.toString()) {
            if (
                sourceColumn === "right" && //
                targetColumn === "top"
            ) {
                return {
                    sourceHandle: edgeHandleMapping.source_left,
                    targetHandle: edgeHandleMapping.target_bottom,
                };
            } else if (
                sourceColumn === "left" && //
                targetColumn === "top"
            ) {
                return {
                    sourceHandle: edgeHandleMapping.source_right,
                    targetHandle: edgeHandleMapping.target_bottom,
                };
            } else if (
                sourceColumn === "top" && //
                targetColumn === "left"
            ) {
                return {
                    sourceHandle: edgeHandleMapping.source_bottom,
                    targetHandle: edgeHandleMapping.target_left,
                };
            } else if (
                sourceColumn === "bottom" && //
                targetColumn === "left"
            ) {
                return {
                    sourceHandle: edgeHandleMapping.source_top,
                    targetHandle: edgeHandleMapping.target_left,
                };
            } else if (
                sourceColumn === "top" && //
                targetColumn === "right"
            ) {
                return {
                    sourceHandle: edgeHandleMapping.source_bottom,
                    targetHandle: edgeHandleMapping.target_right,
                };
            } else if (
                sourceColumn === "bottom" && //
                targetColumn === "right"
            ) {
                return {
                    sourceHandle: edgeHandleMapping.source_top,
                    targetHandle: edgeHandleMapping.target_right,
                };
            } else if (
                sourceColumn === "right" //
            ) {
                return {
                    sourceHandle: edgeHandleMapping.source_left,
                    targetHandle: edgeHandleMapping.target_right,
                };
            } else if (
                sourceColumn === "left" //
            ) {
                return {
                    sourceHandle: edgeHandleMapping.source_right,
                    targetHandle: edgeHandleMapping.target_left,
                };
            } else if (
                sourceColumn === "top" //
            ) {
                return {
                    sourceHandle: edgeHandleMapping.source_bottom,
                    targetHandle: edgeHandleMapping.target_top,
                };
            } else if (
                sourceColumn === "bottom" //
            ) {
                return {
                    sourceHandle: edgeHandleMapping.source_top,
                    targetHandle: edgeHandleMapping.target_bottom,
                };
            }
        } else if (targetNode?.data?.cardRefKey === UserStoryCardRefEnum.card_users.toString()) {
            if (
                targetColumn === "right" && //
                sourceColumn === "top"
            ) {
                return {
                    sourceHandle: edgeHandleMapping.source_bottom,
                    targetHandle: edgeHandleMapping.target_left,
                };
            } else if (
                targetColumn === "left" && //
                sourceColumn === "top"
            ) {
                return {
                    sourceHandle: edgeHandleMapping.source_bottom,
                    targetHandle: edgeHandleMapping.target_right,
                };
            } else if (
                targetColumn === "right" && //
                sourceColumn === "bottom"
            ) {
                return {
                    sourceHandle: edgeHandleMapping.source_top,
                    targetHandle: edgeHandleMapping.target_left,
                };
            } else if (
                targetColumn === "left" && //
                sourceColumn === "bottom"
            ) {
                return {
                    sourceHandle: edgeHandleMapping.source_top,
                    targetHandle: edgeHandleMapping.target_right,
                };
            } else if (
                targetColumn === "top" && //
                sourceColumn === "left"
            ) {
                return {
                    sourceHandle: edgeHandleMapping.source_left,
                    targetHandle: edgeHandleMapping.target_bottom,
                };
            } else if (
                targetColumn === "bottom" && //
                sourceColumn === "left"
            ) {
                return {
                    sourceHandle: edgeHandleMapping.source_left,
                    targetHandle: edgeHandleMapping.target_top,
                };
            } else if (
                targetColumn === "top" && //
                sourceColumn === "right"
            ) {
                return {
                    sourceHandle: edgeHandleMapping.source_right,
                    targetHandle: edgeHandleMapping.target_bottom,
                };
            } else if (
                targetColumn === "bottom" && //
                sourceColumn === "right"
            ) {
                return {
                    sourceHandle: edgeHandleMapping.source_right,
                    targetHandle: edgeHandleMapping.target_top,
                };
            } else if (
                targetColumn === "right" //
            ) {
                return {
                    sourceHandle: edgeHandleMapping.source_right,
                    targetHandle: edgeHandleMapping.target_left,
                };
            } else if (
                targetColumn === "left" //
            ) {
                return {
                    sourceHandle: edgeHandleMapping.source_left,
                    targetHandle: edgeHandleMapping.target_right,
                };
            } else if (
                targetColumn === "top" //
            ) {
                return {
                    sourceHandle: edgeHandleMapping.source_top,
                    targetHandle: edgeHandleMapping.target_bottom,
                };
            } else if (
                targetColumn === "bottom" //
            ) {
                return {
                    sourceHandle: edgeHandleMapping.source_bottom,
                    targetHandle: edgeHandleMapping.target_top,
                };
            }
        }

        if (
            sourceNode?.data?.cardRefKey === UserStoryCardRefEnum.card_interface.toString() ||
            sourceNode?.data?.cardRefKey === UserStoryCardRefEnum.card_devices.toString()
        ) {
            if (sourceColumn === "right") {
                return {
                    sourceHandle: edgeHandleMapping.source_left,
                    targetHandle: edgeHandleMapping.target_right,
                };
            } else if (sourceColumn === "left") {
                return {
                    sourceHandle: edgeHandleMapping.source_right,
                    targetHandle: edgeHandleMapping.target_left,
                };
            } else if (sourceColumn === "top") {
                return {
                    sourceHandle: edgeHandleMapping.source_bottom,
                    targetHandle:
                        sourcePositionAbsolute.x >= targetPositionAbsolute.x
                            ? edgeHandleMapping.target_right
                            : edgeHandleMapping.target_left,
                };
            } else if (sourceColumn === "bottom") {
                return {
                    sourceHandle: edgeHandleMapping.source_top,
                    targetHandle:
                        sourcePositionAbsolute.x >= targetPositionAbsolute.x
                            ? edgeHandleMapping.target_right
                            : edgeHandleMapping.target_left,
                };
            }
        } else if (
            targetNode?.data?.cardRefKey === UserStoryCardRefEnum.card_interface.toString() ||
            targetNode?.data?.cardRefKey === UserStoryCardRefEnum.card_devices.toString()
        ) {
            if (targetColumn === "right") {
                return {
                    sourceHandle: edgeHandleMapping.source_right,
                    targetHandle: edgeHandleMapping.target_left,
                };
            } else if (targetColumn === "left") {
                return {
                    sourceHandle: edgeHandleMapping.source_left,
                    targetHandle: edgeHandleMapping.target_right,
                };
            } else if (targetColumn === "top") {
                return {
                    sourceHandle:
                        sourcePositionAbsolute.x >= targetPositionAbsolute.x
                            ? edgeHandleMapping.source_left
                            : edgeHandleMapping.source_right,
                    targetHandle: edgeHandleMapping.target_bottom,
                };
            } else if (targetColumn === "bottom") {
                return {
                    sourceHandle:
                        sourcePositionAbsolute.x >= targetPositionAbsolute.x
                            ? edgeHandleMapping.source_left
                            : edgeHandleMapping.source_right,
                    targetHandle: edgeHandleMapping.target_top,
                };
            }
        }

        if (!targetNode?.data?.cardRefKey) {
            return {
                sourceHandle: edgeHandleMapping.source_left,
                targetHandle: edgeHandleMapping.target_right,
            };
        } else if (!sourceNode?.data?.cardRefKey) {
            return {
                sourceHandle: edgeHandleMapping.source_right,
                targetHandle: edgeHandleMapping.target_left,
            };
        }
        return {
            sourceHandle: edge.sourceHandle,
            targetHandle: edge.targetHandle,
        };
    }
}
