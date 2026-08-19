import { CanvasType } from "#root/enums/diagram";
import { DiagramCanvas, DiagramEdge, DiagramNode, ProjectDiagram } from "#root/interfaces/diagram";
import { createInitialDiagramInstanceState } from "#root/redux/projectDiagramFeatureSlice";
import { RootState } from "#root/redux/store";

export const getArchitectureCanvas = (
    projectDiagram?: ProjectDiagram | null
): DiagramCanvas | undefined => {
    return projectDiagram?.canvas?.find((canvas) => {
        return canvas?.canvas_type === CanvasType.architecture;
    });
};

export const getArchitectureNodes = (projectDiagram?: ProjectDiagram | null): DiagramNode[] => {
    return getArchitectureCanvas(projectDiagram)?.nodes || [];
};

export const getArchitectureEdges = (projectDiagram?: ProjectDiagram | null): DiagramEdge[] => {
    return getArchitectureCanvas(projectDiagram)?.edges || [];
};

export const getAllNodes = (projectDiagram?: ProjectDiagram | null): DiagramNode[] => {
    return projectDiagram?.canvas?.flatMap((canvas) => canvas?.nodes || []) || [];
};

export const getAllEdges = (projectDiagram?: ProjectDiagram | null): DiagramEdge[] => {
    return projectDiagram?.canvas?.flatMap((canvas) => canvas?.edges || []) || [];
};

export const resolveDraftCanvasId = (
    diagramInstances: RootState["diagram"]["instances"],
    instanceId?: string
): string => {
    const requestedDiagramState = instanceId ? diagramInstances[instanceId] : undefined;
    if (requestedDiagramState) {
        return requestedDiagramState.draftCanvasId;
    }

    const firstDiagramState =
        Object.values(diagramInstances)[0] ?? createInitialDiagramInstanceState();
    return firstDiagramState.draftCanvasId;
};

export const getCanvasById = ({
    canvasId,
    projectDiagram,
}: {
    canvasId: string | undefined;
    projectDiagram: ProjectDiagram | null | undefined;
}): DiagramCanvas | undefined => {
    if (!canvasId || !projectDiagram) {
        return undefined;
    }

    return projectDiagram.canvas?.find((canvas) => canvas.canvas_id === canvasId);
};

export const getSelectedCanvas = ({
    diagramInstances,
    instanceId,
    projectDiagram,
}: {
    diagramInstances: RootState["diagram"]["instances"];
    instanceId: string | undefined;
    projectDiagram: ProjectDiagram | null | undefined;
}): DiagramCanvas | undefined => {
    const draftCanvasId = resolveDraftCanvasId(diagramInstances, instanceId);
    if (!draftCanvasId || !projectDiagram) {
        return undefined;
    }

    return getCanvasById({
        canvasId: draftCanvasId,
        projectDiagram,
    });
};
