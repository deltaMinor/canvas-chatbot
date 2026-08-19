import { CanvasNodeVariantType } from "#root/enums/diagram";
import {
    DiagramCanvas,
    DiagramEdge,
    DiagramNode,
    ProjectDiagram,
    WarningMessage,
} from "#root/interfaces/diagram";

export const normalizeDiagramNodes = (nodes: DiagramNode[] = []): DiagramNode[] => {
    return nodes.map((node) =>
        node.type === CanvasNodeVariantType.clusterNode.toString()
            ? {
                  ...node,
                  dragHandle: ".ClusterNode_DragHandle",
              }
            : node
    );
};

export const normalizeDiagramCanvas = (canvas: DiagramCanvas): DiagramCanvas => ({
    ...canvas,
    nodes: normalizeDiagramNodes(canvas.nodes),
});

export const mergeUpdatedProjectDiagram = ({
    projectDiagram,
    patch,
}: {
    projectDiagram: ProjectDiagram;
    patch: Partial<ProjectDiagram>;
}): ProjectDiagram => {
    const normalizedCanvas = patch.canvas?.map(normalizeDiagramCanvas);

    return {
        ...projectDiagram,
        ...patch,
        ...(normalizedCanvas && { canvas: normalizedCanvas }),
    };
};

export const buildUpdatedCanvasProjectDiagram = ({
    projectDiagram,
    canvasId,
    canvasNodes,
    canvasEdges,
    viewport,
}: {
    projectDiagram: ProjectDiagram;
    canvasId: string;
    canvasNodes?: DiagramNode[];
    canvasEdges?: DiagramEdge[];
    viewport: DiagramCanvas["viewport"];
}): {
    projectDiagram: ProjectDiagram;
    selectedCanvas: DiagramCanvas<WarningMessage>;
} => {
    const selectedCanvas =
        projectDiagram.canvas.find((canvas) => canvas.canvas_id === canvasId) ??
        ({} as DiagramCanvas<WarningMessage>);

    const updatedCanvas = {
        ...selectedCanvas,
        nodes: normalizeDiagramNodes(canvasNodes ?? selectedCanvas.nodes ?? []),
        edges: canvasEdges ?? selectedCanvas.edges ?? [],
        viewport,
    };

    return {
        projectDiagram: {
            ...projectDiagram,
            canvas: projectDiagram.canvas.map((canvas) =>
                canvas.canvas_id === canvasId ? updatedCanvas : canvas
            ),
        },
        selectedCanvas: updatedCanvas,
    };
};

export const buildUpdatedEdgeProjectDiagram = ({
    projectDiagram,
    canvasId,
    edge,
}: {
    projectDiagram: ProjectDiagram;
    canvasId: string;
    edge: DiagramEdge;
}) => {
    const updatedEdge = {
        ...edge,
        selected: false,
    };

    return {
        updatedEdge,
        projectDiagram: {
            ...projectDiagram,
            canvas: projectDiagram.canvas.map((canvas) => {
                if (canvas.canvas_id !== canvasId) {
                    return canvas;
                }

                return {
                    ...canvas,
                    edges: canvas.edges.map((existingEdge) =>
                        existingEdge.id !== updatedEdge.id ? existingEdge : updatedEdge
                    ),
                };
            }),
        },
    };
};

export const buildUpdatedNodeProjectDiagram = ({
    projectDiagram,
    canvasId,
    node,
}: {
    projectDiagram: ProjectDiagram;
    canvasId: string;
    node: DiagramNode;
}) => {
    const updatedNode = {
        ...node,
        dragHandle:
            node.type === CanvasNodeVariantType.clusterNode.toString()
                ? ".ClusterNode_DragHandle"
                : (node.dragHandle ?? ""),
        selected: false,
    };

    return {
        updatedNode,
        projectDiagram: {
            ...projectDiagram,
            canvas: projectDiagram.canvas.map((canvas) => {
                if (canvas.canvas_id !== canvasId) {
                    return canvas;
                }

                return {
                    ...canvas,
                    nodes: canvas.nodes.map((existingNode) =>
                        existingNode.id !== updatedNode.id ? existingNode : updatedNode
                    ),
                };
            }),
        },
    };
};
