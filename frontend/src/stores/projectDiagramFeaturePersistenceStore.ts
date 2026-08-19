import { DiagramCanvas, DiagramEdge, DiagramNode, ProjectDiagram } from "#root/interfaces/diagram";
import {
    patchProjectDiagram,
    updateProjectDiagramCanvas,
    updateProjectDiagramEdge,
    updateProjectDiagramNode,
} from "#root/services/domain/diagram";
import {
    getBackendCanvasByIdFromStore,
    getBackendProjectDiagramFromStore,
    getBackendProjectIdFromStore,
    getDraftCanvasIdFromStore,
    setBackendProjectDiagram,
} from "#root/stores/projectDiagram/backend";
import { getDiagramBackendSaveEnabledFromStore } from "#root/stores/projectDiagram/canvas";
import {
    buildUpdatedCanvasProjectDiagram,
    buildUpdatedEdgeProjectDiagram,
    buildUpdatedNodeProjectDiagram,
    mergeUpdatedProjectDiagram,
} from "#root/utils/diagram/diagramBodyUtil";
import {
    buildProjectDiagramWithSharedNodeUpdates,
    cloneProjectDiagramWithoutSelections,
} from "#root/utils/diagram/diagramStoreUtil";

// ==============================
// Project Diagram Persistence
// ==============================

export const updateProjectDiagramInDatabase = async (p: Partial<ProjectDiagram>) => {
    const projectDiagram = getBackendProjectDiagramFromStore();
    const clonedProjectDiagram = cloneProjectDiagramWithoutSelections(projectDiagram);

    await patchProjectDiagram({
        ...p,
        project_id: clonedProjectDiagram.project_id,
    });
};

export const updateProjectDiagram = async (patch: Partial<ProjectDiagram>) => {
    const projectDiagram = getBackendProjectDiagramFromStore();
    const nextProjectDiagram = mergeUpdatedProjectDiagram({
        projectDiagram,
        patch,
    });

    setBackendProjectDiagram(nextProjectDiagram);
    await updateProjectDiagramInDatabase(nextProjectDiagram);
};

// ==============================
// Canvas Persistence
// ==============================

export const updateSingleCanvasInDatabase = async ({
    canvas,
    canvas_id,
}: {
    canvas: DiagramCanvas;
    canvas_id: string;
}) => {
    await updateProjectDiagramCanvas({
        project_id: getBackendProjectIdFromStore(),
        canvas_id,
        canvas,
    });
};

export const updateCanvas = async ({
    instanceId,
    canvasNodes,
    canvasEdges,
    draftCanvasId: propsDraftCanvasId,
    viewport,
}: {
    instanceId: string;
    canvasNodes?: DiagramNode[];
    canvasEdges?: DiagramEdge[];
    draftCanvasId?: string;
    viewport?: DiagramCanvas["viewport"];
    funcRef?: string;
}) => {
    if (!getDiagramBackendSaveEnabledFromStore(instanceId)) {
        return null;
    }

    const projectDiagram = getBackendProjectDiagramFromStore();
    const resolvedDraftCanvasId = propsDraftCanvasId ?? getDraftCanvasIdFromStore(instanceId);

    if (!resolvedDraftCanvasId) {
        throw new Error("No selected canvas.");
    }

    const currentCanvas = getBackendCanvasByIdFromStore(resolvedDraftCanvasId);
    const resolvedViewport = viewport ?? currentCanvas?.viewport;
    if (!resolvedViewport) {
        throw new Error("No canvas viewport.");
    }

    const updatedDiagram = buildUpdatedCanvasProjectDiagram({
        projectDiagram,
        canvasId: resolvedDraftCanvasId,
        ...(canvasNodes && { canvasNodes }),
        ...(canvasEdges && { canvasEdges }),
        viewport: resolvedViewport,
    });

    setBackendProjectDiagram(updatedDiagram.projectDiagram);
    await updateSingleCanvasInDatabase({
        canvas: updatedDiagram.selectedCanvas,
        canvas_id: resolvedDraftCanvasId,
    });

    return updatedDiagram.selectedCanvas;
};

// ==============================
// Edge Persistence
// ==============================

export const updateSingleEdgeInDatabase = async ({
    edge,
    canvas_id,
}: {
    edge: DiagramEdge;
    canvas_id: string;
}) => {
    await updateProjectDiagramEdge({
        project_id: getBackendProjectIdFromStore(),
        canvas_id,
        edge_id: edge.id,
        edge,
    });
};

export const updateSingleEdge = async ({
    edge,
    canvas_id,
    instanceId,
}: {
    edge: DiagramEdge;
    canvas_id: string;
    instanceId?: string;
    funcRef?: string;
}) => {
    if (instanceId && !getDiagramBackendSaveEnabledFromStore(instanceId)) {
        return null;
    }

    const projectDiagram = getBackendProjectDiagramFromStore();
    const updatedDiagram = buildUpdatedEdgeProjectDiagram({
        projectDiagram,
        canvasId: canvas_id,
        edge,
    });
    const selectedCanvas =
        getBackendCanvasByIdFromStore(canvas_id) ??
        updatedDiagram.projectDiagram.canvas.find((canvas) => canvas.canvas_id === canvas_id);

    setBackendProjectDiagram(updatedDiagram.projectDiagram);
    await updateSingleEdgeInDatabase({ edge: updatedDiagram.updatedEdge, canvas_id });

    return selectedCanvas;
};

// ==============================
// Node Persistence
// ==============================

export const updateSingleNodeInDatabase = async ({
    node,
    canvas_id,
}: {
    node: DiagramNode;
    canvas_id: string;
}) => {
    await updateProjectDiagramNode({
        project_id: getBackendProjectIdFromStore(),
        canvas_id,
        node_id: node.id,
        node,
    });
};

export const updateSingleNode = async ({
    node,
    canvas_id,
    instanceId,
}: {
    node: DiagramNode;
    canvas_id: string;
    instanceId?: string;
    funcRef?: string;
}) => {
    if (instanceId && !getDiagramBackendSaveEnabledFromStore(instanceId)) {
        return null;
    }

    const projectDiagram = getBackendProjectDiagramFromStore();
    const updatedDiagram = buildUpdatedNodeProjectDiagram({
        projectDiagram,
        canvasId: canvas_id,
        node,
    });
    const selectedCanvas = updatedDiagram.projectDiagram.canvas.find(
        (canvas) => canvas.canvas_id === canvas_id
    );

    setBackendProjectDiagram(updatedDiagram.projectDiagram as ProjectDiagram);
    await updateSingleNodeInDatabase({ node: updatedDiagram.updatedNode, canvas_id });

    return selectedCanvas;
};

export const updateAllCanvasesWithSameNodes = async ({
    instanceId,
    node,
}: {
    instanceId: string;
    node: DiagramNode;
}) => {
    if (!getDiagramBackendSaveEnabledFromStore(instanceId)) {
        return;
    }

    const projectDiagram = getBackendProjectDiagramFromStore();
    const draftCanvasId = getDraftCanvasIdFromStore(instanceId);
    const { nextProjectDiagram, updatedNodesByCanvasId } = buildProjectDiagramWithSharedNodeUpdates(
        {
            projectDiagram,
            node,
            selectedCanvasId: draftCanvasId,
        }
    );

    for (const updatedNodeEntry of updatedNodesByCanvasId) {
        await updateSingleNodeInDatabase({
            node: updatedNodeEntry.node,
            canvas_id: updatedNodeEntry.canvas_id,
        });
    }

    setBackendProjectDiagram(nextProjectDiagram);
};
