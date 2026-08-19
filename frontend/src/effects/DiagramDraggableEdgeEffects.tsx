import {
    useDraggableEdgeHandleListenersEffect,
    useDraggableEdgeSegmentedPathEffect,
    useInitDraggableEdgeLineSegmentsEffect,
} from "#root/hooks/diagram";
import { LineSegment } from "#root/interfaces/diagram";

interface DiagramDraggableEdgeEffectsProps {
    currentLineSegments: LineSegment[];
    id: string;
    sourceHandleId: string | null | undefined;
    sourceX: number;
    sourceY: number;
    targetHandleId: string | null | undefined;
    targetX: number;
    targetY: number;
}

const DiagramDraggableEdgeEffects = ({
    currentLineSegments,
    id,
    sourceHandleId,
    sourceX,
    sourceY,
    targetHandleId,
    targetX,
    targetY,
}: DiagramDraggableEdgeEffectsProps) => {
    useDraggableEdgeSegmentedPathEffect({
        currentLineSegments,
        id,
        sourceHandleId,
        sourceX,
        sourceY,
        targetHandleId,
        targetX,
        targetY,
    });

    useInitDraggableEdgeLineSegmentsEffect({
        currentLineSegments, //
        id,
    });

    useDraggableEdgeHandleListenersEffect({
        currentLineSegments, //
        id,
    });

    return null;
};

export default DiagramDraggableEdgeEffects;
