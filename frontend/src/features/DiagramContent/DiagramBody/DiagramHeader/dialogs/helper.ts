import { ReactFlowInstance, Viewport, getViewportForBounds } from "@xyflow/react";
import { toPng } from "html-to-image";

import { CanvasType, DiagramEdge, DiagramNode } from "#root/interfaces/diagram";
import { ServiceDomainProps } from "#root/interfaces/domain";
import { getProjectDiagramFromStore, getProjectIdFromStore } from "#root/stores/backendStore";
import { getDraftCanvasIdFromStore } from "#root/stores/projectDiagram/backend";
import {
    getDiagramDraftCanvasEdgesFromStore,
    getDiagramDraftCanvasFromStore,
    getDiagramDraftCanvasNodesFromStore,
    getDiagramDraftCanvasTypeFromStore,
    setDiagramDraftCanvas,
} from "#root/stores/projectDiagram/canvas";
import {
    getActiveEdgesFromStore,
    getActiveNodesFromStore,
} from "#root/stores/projectDiagram/selection";
import { getDiagramHiddenEdgeIdsFromStore } from "#root/stores/projectDiagram/visibility";
import { updateProjectDiagram } from "#root/stores/projectDiagramFeaturePersistenceStore";
import { processDeleteAllNodesAndEdges } from "#root/utils/diagram";
import { clearProjectCanvasHistory } from "#root/utils/diagram/diagramCanvasHistoryUtil";
import { updateCanvasViewOnly } from "#root/utils/diagram/diagramCanvasUtil";
import { getThreatMappedEdgeVisibilityId } from "#root/utils/diagram/diagramEdgeVisibilityPreferenceUtil";

const getCanvasNodesForExport = (instanceId: string) => getActiveNodesFromStore(instanceId);

const getCanvasEdgesForExport = (instanceId: string) => {
    const activeEdges = getActiveEdgesFromStore(instanceId);
    const hiddenEdgeIdSet = new Set(getDiagramHiddenEdgeIdsFromStore(instanceId));

    return activeEdges.map((edge) => {
        const edgeVisibilityId = getThreatMappedEdgeVisibilityId(edge);

        if (!edgeVisibilityId || !hiddenEdgeIdSet.has(edgeVisibilityId)) {
            return edge;
        }

        return {
            ...edge,
            hidden: true,
        };
    });
};

const handleSaveImage = async (
    {
        instanceId,
        reactFlow,
    }: {
        instanceId: string;
        reactFlow: ReactFlowInstance<DiagramNode, DiagramEdge>;
    },
    serviceDomainProps: ServiceDomainProps
) => {
    const projectDiagram = getProjectDiagramFromStore();
    if (!projectDiagram) return;
    const project_id = getProjectIdFromStore();
    if (!project_id) return;
    const selectedCanvasType = getDiagramDraftCanvasTypeFromStore(instanceId);
    const nodes = getCanvasNodesForExport(instanceId);
    const edges = getCanvasEdgesForExport(instanceId);

    const imageWidth = 1920;
    const imageHeight = 1080;

    if (!nodes.length && !edges.length) {
        return;
    }

    const { getNodesBounds } = reactFlow;
    const nodesBounds = getNodesBounds(nodes);
    const transform: Viewport = getViewportForBounds(
        nodesBounds,
        imageWidth,
        imageHeight,
        0.5,
        2,
        0
    );

    const _element = document.querySelector(".react-flow__viewport") as HTMLElement;

    if (!_element && selectedCanvasType !== CanvasType.summary) return;

    await toPng(_element, {
        backgroundColor: "#fff",
        width: imageWidth,
        height: imageHeight,
        style: {
            width: `${imageWidth}px`,
            height: `${imageHeight}px`,
            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.zoom})`,
        },
    });

    // await addLLMImage(
    //     {
    //         project_id, //
    //         imageUrl,
    //         label: "Architecture Diagram",
    //         is_generated: true,
    //         is_uploaded: false,
    //     },
    //     serviceDomainProps
    // );
};

export const processSetDiagramComplete = async (
    {
        instanceId,
        isCompleted,
        reactFlow,
    }: {
        instanceId: string;
        isCompleted: boolean;
        reactFlow: ReactFlowInstance<DiagramNode, DiagramEdge>;
    },
    serviceDomainProps: ServiceDomainProps = {}
) => {
    const projectDiagram = getProjectDiagramFromStore();
    if (!projectDiagram) return;

    const _projectDiagram = {
        ...projectDiagram, //
        isCompleted,
    };
    updateCanvasViewOnly(_projectDiagram);
    const draftCanvasId = getDraftCanvasIdFromStore(instanceId);
    const nextSelectedCanvas = _projectDiagram.canvas.find(
        (canvas) => canvas.canvas_id === draftCanvasId
    );

    if (nextSelectedCanvas) {
        setDiagramDraftCanvas(nextSelectedCanvas, instanceId);
    }

    await updateProjectDiagram(_projectDiagram);

    if (!!isCompleted) {
        await handleSaveImage(
            {
                instanceId,
                reactFlow,
            },
            serviceDomainProps
        );
    }
};

export const processConfirmClearDiagram = async ({
    instanceId,
    handleSetProcessedNodesAndEdges,
    resetOverlappingLineSegments,
}: {
    instanceId: string;
    handleSetProcessedNodesAndEdges: (p: {
        canvasNodes: DiagramNode[];
        canvasEdges: DiagramEdge[];
        funcRef?: string;
    }) => Promise<void>;
    resetOverlappingLineSegments: (edges: DiagramEdge[], new_edge: DiagramEdge) => void;
}) => {
    const projectDiagram = getProjectDiagramFromStore();
    if (!projectDiagram) return;
    const project_id = getProjectIdFromStore();
    const draftCanvasId = getDraftCanvasIdFromStore(instanceId) ?? "";
    const selectedCanvas = getDiagramDraftCanvasFromStore(instanceId);
    const selectedCanvasType = getDiagramDraftCanvasTypeFromStore(instanceId);
    const context__nodes = getDiagramDraftCanvasNodesFromStore(instanceId);
    const context__edges = getDiagramDraftCanvasEdgesFromStore(instanceId);

    if (!selectedCanvas) return;

    const canvasToClear =
        projectDiagram.canvas.find((canvas) => canvas.canvas_id === draftCanvasId) ??
        selectedCanvas;

    let canvasNodeIdList: string[] = [];

    //  only architecture canvas nodes are deletable
    if (selectedCanvasType === CanvasType.architecture) {
        canvasNodeIdList = canvasToClear.nodes.map((n) => n.id);
    }

    const canvasEdgeIdList = canvasToClear.edges.map((e) => e.id);

    if (!selectedCanvas) return;

    await processDeleteAllNodesAndEdges({
        projectDiagram,
        updateProjectDiagram: (params) => updateProjectDiagram(params),
        selectedCanvasId: draftCanvasId,
        handleSetProcessedNodesAndEdges,
        context__nodes,
        context__edges,
        selectedCanvas,
        selectedCanvasType,
        resetOverlappingLineSegments,
        selectedNodeIdList: canvasNodeIdList,
        selectedEdgeIdList: canvasEdgeIdList,
    });

    if (project_id) {
        clearProjectCanvasHistory({
            instanceId,
            project_id,
        });
    }
};
