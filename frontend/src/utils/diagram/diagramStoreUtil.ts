import React from "react";

import { DiagramNode, ProjectDiagram } from "#root/interfaces/diagram";

export const cloneProjectDiagramWithoutSelections = (
    projectDiagram: ProjectDiagram
): ProjectDiagram => {
    const clonedProjectDiagram = structuredClone(projectDiagram);

    clonedProjectDiagram.canvas.forEach((canvas) => {
        canvas.nodes.forEach((node) => {
            node.selected = false;
        });
        canvas.edges.forEach((edge) => {
            edge.selected = false;
        });
    });

    return clonedProjectDiagram;
};

const buildSharedCanvasNode = ({
    originalNode,
    node,
    selectedCanvasId,
    canvasId,
}: {
    originalNode: DiagramNode;
    node: DiagramNode;
    selectedCanvasId: string | null | undefined;
    canvasId: string;
}): DiagramNode => {
    if (canvasId === selectedCanvasId) {
        return node;
    }

    return {
        ...originalNode,
        ariaLabel: node.ariaLabel || "",
        data: {
            ...originalNode.data,
            icon_position: node.data?.icon_position ?? "",
            infrastructure_type: node.data?.["infrastructure_type"] ?? "",
            isDeployed: node.data?.["isDeployed"] ?? false,
            isProprietary: node.data?.["isProprietary"] ?? false,
            label: node.data?.label ?? "",
            node_kind: node.data?.["node_kind"] ?? "",
            node_type: node.data?.["node_type"] ?? "",
            properties: node.data?.["properties"] ?? {},
            service_type: node.data?.["service_type"] ?? "",
            shape: node.data?.["shape"] ?? "",
            technology: node.data?.["technology"] ?? "",
            tosca_node_type: node.data?.["tosca_node_type"] ?? "",
            trust_boundary: node.data?.["trust_boundary"] ?? "",
            type: node.data?.type ?? originalNode.data?.type,
        },
        style: node.style,
        selected: false,
        width: node.width,
        height: node.height,
    } as DiagramNode;
};

export const buildProjectDiagramWithSharedNodeUpdates = ({
    projectDiagram,
    node,
    selectedCanvasId,
}: {
    projectDiagram: ProjectDiagram;
    node: DiagramNode;
    selectedCanvasId: string | null | undefined;
}) => {
    const nextProjectDiagram = structuredClone(projectDiagram);
    const updatedNodesByCanvasId: Array<{ canvas_id: string; node: DiagramNode }> = [];

    for (const canvas of nextProjectDiagram.canvas || []) {
        const nodeIndex = canvas.nodes.findIndex((existingNode) => existingNode.id === node.id);
        if (nodeIndex < 0) {
            continue;
        }

        const originalNode = canvas.nodes[nodeIndex];
        if (!originalNode) {
            continue;
        }

        const updatedNode = buildSharedCanvasNode({
            originalNode,
            node,
            selectedCanvasId,
            canvasId: canvas.canvas_id,
        });

        canvas.nodes[nodeIndex] = updatedNode;
        updatedNodesByCanvasId.push({
            canvas_id: canvas.canvas_id,
            node: updatedNode,
        });
    }

    return {
        nextProjectDiagram,
        updatedNodesByCanvasId,
    };
};

export const getInstanceValuePayloadFromStore = <T>(value: T, instanceId: string) => {
    return instanceId ? { instanceId, value } : { value };
};

export const resolveNextStateAction = <T>(value: React.SetStateAction<T>, currentValue: T): T => {
    return typeof value === "function" ? (value as (previousValue: T) => T)(currentValue) : value;
};
