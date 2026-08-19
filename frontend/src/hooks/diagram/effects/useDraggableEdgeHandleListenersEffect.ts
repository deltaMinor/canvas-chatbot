import React from "react";

import { useStore } from "@xyflow/react";
import { D3DragEvent, SubjectPosition, drag } from "d3-drag";
import { select } from "d3-selection";

import { useDragHandleRefs, useDraggableEdgeActions } from "#root/hooks/diagram";
import { DragHandleType, type LineSegment } from "#root/interfaces/diagram";
import { computeLineSegmentOffset } from "#root/utils/diagram/diagramDraggableEdgeUtil";

interface UseDraggableEdgeHandleListenersEffectParams {
    currentLineSegments: LineSegment[];
    id: string;
}

export const useDraggableEdgeHandleListenersEffect = ({
    currentLineSegments,
    id,
}: UseDraggableEdgeHandleListenersEffectParams) => {
    const zoom = useStore((state) => state.transform[2]);
    const { dragHandleRefs } = useDragHandleRefs();
    const { updateEdgeWithNewLineSegments } = useDraggableEdgeActions();
    const { handleUpdateSingleEdgeLineSegments } = useDraggableEdgeActions();

    const resetDragHandleListener = React.useCallback(
        (refsByKeys: Record<string, HTMLDivElement | null>, newLineSegments: LineSegment[]) => {
            newLineSegments.forEach((lineSegment) => {
                const segmentId = lineSegment.id;
                const ref = refsByKeys[segmentId];

                if (!ref) {
                    return;
                }

                const d3Selection = select(ref);
                const d3Func = drag<HTMLDivElement, unknown>()
                    .on("drag", (event: D3DragEvent<HTMLDivElement, unknown, SubjectPosition>) => {
                        if (lineSegment.direction === DragHandleType.vertical) {
                            computeLineSegmentOffset(lineSegment, event.dx / zoom);
                        } else {
                            computeLineSegmentOffset(lineSegment, event.dy / zoom);
                        }

                        handleUpdateSingleEdgeLineSegments(id, newLineSegments);
                    })
                    .on("end", () => {
                        updateEdgeWithNewLineSegments(id);
                    });

                d3Selection.call(d3Func);
            });
        },
        [handleUpdateSingleEdgeLineSegments, id, updateEdgeWithNewLineSegments, zoom]
    );

    React.useEffect(() => {
        if (!currentLineSegments.length) {
            return;
        }

        resetDragHandleListener(dragHandleRefs, currentLineSegments);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentLineSegments]);
};

export default useDraggableEdgeHandleListenersEffect;
