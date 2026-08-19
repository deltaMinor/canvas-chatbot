import React from "react";

import { useReactFlow } from "@xyflow/react";

import {
    useDiagramEdgeSegmentedPath,
    useNodeHandleEdgeMapping,
    useSetDiagramEdgeSegmentedPath,
} from "#root/hooks/diagram";
import { DiagramEdge, DiagramNode, LineSegment } from "#root/interfaces/diagram";
import { getSegmentedSmoothStepPath } from "#root/utils/diagram/diagramEdgePathUtil";
import { computeCurrentPoint } from "#root/utils/diagram/diagramEdgeUtil";

interface UseDraggableEdgeSegmentedPathEffectParams {
    currentLineSegments: LineSegment[];
    id: string;
    sourceHandleId: string | null | undefined;
    sourceX: number;
    sourceY: number;
    targetHandleId: string | null | undefined;
    targetX: number;
    targetY: number;
}

export const useDraggableEdgeSegmentedPathEffect = ({
    currentLineSegments,
    id,
    sourceHandleId,
    sourceX,
    sourceY,
    targetHandleId,
    targetX,
    targetY,
}: UseDraggableEdgeSegmentedPathEffectParams) => {
    const { getEdges } = useReactFlow<DiagramNode, DiagramEdge>();
    const nodeHandleEdgeMapping = useNodeHandleEdgeMapping();
    const segmentedPath = useDiagramEdgeSegmentedPath(id);
    const setSegmentedPath = useSetDiagramEdgeSegmentedPath();

    React.useEffect(() => {
        const allEdges = getEdges();
        const currentEdge = allEdges.find((edge) => edge.id === id);

        if (!currentEdge) {
            return;
        }

        const [currentPoints] = computeCurrentPoint({
            currentEdge,
            edgeProps: {
                sourceHandleId: sourceHandleId ?? null,
                targetHandleId: targetHandleId ?? null,
                sourceX,
                sourceY,
                targetX,
                targetY,
            },
            nodeHandleEdgeMapping,
        });
        const nextSegmentedPath = getSegmentedSmoothStepPath({
            points: currentPoints,
            lineSegments: currentLineSegments,
        });

        if (segmentedPath === nextSegmentedPath) {
            return;
        }

        setSegmentedPath(id, nextSegmentedPath);
    }, [
        currentLineSegments,
        getEdges,
        id,
        nodeHandleEdgeMapping,
        segmentedPath,
        setSegmentedPath,
        sourceHandleId,
        sourceX,
        sourceY,
        targetHandleId,
        targetX,
        targetY,
    ]);
};

export default useDraggableEdgeSegmentedPathEffect;
