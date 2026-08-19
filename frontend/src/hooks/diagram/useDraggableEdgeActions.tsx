import React from "react";

import { useDiagramInstanceId } from "#root/contexts/DiagramInstanceContext";
import {
    useAppendCanvasHistory,
    useGetNodeHandleEdgeMapping,
    useHandleSetProcessedEdges,
} from "#root/hooks/diagram";
import { CanvasType, DiagramEdge, LineSegment } from "#root/interfaces/diagram";
import { LineSegmentResolver } from "#root/lib/LineSegmentResolver";
import { getDraftCanvasIdFromStore } from "#root/stores/projectDiagram/backend";
import {
    getDiagramDraftCanvasEdgesFromStore,
    getDiagramDraftCanvasNodesFromStore,
    getDiagramDraftCanvasTypeFromStore,
} from "#root/stores/projectDiagram/canvas";
import {
    getDiagramLineSegmentsFromStore,
    setDiagramLineSegments,
} from "#root/stores/projectDiagram/draggableEdge";
import { updateSingleEdge } from "#root/stores/projectDiagramFeaturePersistenceStore";
import { getFilteredCanvasNodesOrEdges } from "#root/utils/diagram";
import { getOverlappingEdgesInOrder } from "#root/utils/diagram/diagramEdgeUtil";

export const useDraggableEdgeActions = () => {
    const instanceId = useDiagramInstanceId();
    const appendCanvasHistory = useAppendCanvasHistory();
    const getNodeHandleEdgeMapping = useGetNodeHandleEdgeMapping();
    const handleSetProcessedEdges = useHandleSetProcessedEdges();

    const handleUpdateSingleEdgeLineSegments = React.useCallback(
        (edgeId: string, newLineSegments: LineSegment[]) => {
            setDiagramLineSegments(
                (prev) => ({
                    ...prev,
                    [edgeId]: newLineSegments,
                }),
                instanceId
            );
        },
        [instanceId]
    );

    const refreshLineSegments = React.useCallback(
        (edges?: DiagramEdge[]) => {
            const contextEdges = getDiagramDraftCanvasEdgesFromStore(instanceId);

            const nextLineSegments = {} as Record<string, LineSegment[]>;
            const resolvedEdges = edges ?? contextEdges;
            resolvedEdges.forEach((edge) => {
                if (Object.keys(edge?.data?.lineSegments || {})?.length) {
                    nextLineSegments[edge.id] = edge?.data?.lineSegments || [];
                }
            });
            setDiagramLineSegments(nextLineSegments, instanceId);
        },
        [instanceId]
    );

    const resetOverlappingLineSegments = React.useCallback(
        (
            visibleEdges: DiagramEdge[],
            newEdge: DiagramEdge,
            nodes = getDiagramDraftCanvasNodesFromStore(instanceId)
        ) => {
            const sourceEdgesInOrder = getOverlappingEdgesInOrder({
                edges: visibleEdges,
                allNodes: nodes,
                refNodeId: newEdge?.source || "",
                refNodehandle: newEdge?.sourceHandle || "",
            });
            const targetEdgesInOrder = getOverlappingEdgesInOrder({
                edges: visibleEdges,
                allNodes: nodes,
                refNodeId: newEdge?.target || "",
                refNodehandle: newEdge?.targetHandle || "",
            });
            const nodeHandleEdgeMapping = getNodeHandleEdgeMapping({
                nodes,
                edges: visibleEdges,
            });
            const resolver = new LineSegmentResolver(nodes, nodeHandleEdgeMapping);

            const nextLineSegments = {} as Record<string, LineSegment[]>;
            [...(sourceEdgesInOrder || []), ...(targetEdgesInOrder || [])].forEach((edge) => {
                nextLineSegments[edge.id] = resolver.computeLineSegments({ edge });
            });
            setDiagramLineSegments(
                (prev) => ({
                    ...prev,
                    ...nextLineSegments,
                }),
                instanceId
            );
        },
        [getNodeHandleEdgeMapping, instanceId]
    );

    const updateEdgeWithNewLineSegments = React.useCallback(
        async (edgeId: string) => {
            const edges = getDiagramDraftCanvasEdgesFromStore(instanceId);
            const selectedCanvasType = getDiagramDraftCanvasTypeFromStore(instanceId);
            const lineSegments = getDiagramLineSegmentsFromStore(instanceId);
            const selectedCanvasId = getDraftCanvasIdFromStore(instanceId) ?? "";

            const filteredEdges = getFilteredCanvasNodesOrEdges<DiagramEdge>(
                edges,
                selectedCanvasType ?? CanvasType.architecture
            );
            const edge = filteredEdges.find((value) => value?.id === edgeId) ?? ({} as DiagramEdge);

            const updatedEdge = {
                ...edge,
                data: {
                    ...edge?.data,
                    lineSegments: lineSegments[edgeId] ?? [],
                },
            };

            const canvasEdges = filteredEdges.map((value) =>
                edgeId === value?.id ? updatedEdge : value
            );

            handleSetProcessedEdges({
                canvasEdges,
                funcRef: "updateEdgeWithNewLineSegments",
            });
            const nextSelectedCanvas = await updateSingleEdge({
                edge: updatedEdge,
                canvas_id: selectedCanvasId,
                instanceId,
            });
            if (nextSelectedCanvas) {
                appendCanvasHistory(nextSelectedCanvas);
            }
        },
        [appendCanvasHistory, handleSetProcessedEdges, instanceId]
    );

    return {
        handleUpdateSingleEdgeLineSegments,
        refreshLineSegments,
        resetOverlappingLineSegments,
        updateEdgeWithNewLineSegments,
    };
};
