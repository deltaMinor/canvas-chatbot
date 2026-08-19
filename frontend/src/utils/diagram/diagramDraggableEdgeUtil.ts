import { DEFAULT_DRAG_INTERVAL } from "#root/constants/diagram";
import { DragHandleType } from "#root/enums/diagram";
import { LineSegment } from "#root/interfaces/diagram";

const alignLineSegments = (
    lineSegments: LineSegment[],
    currentLineSegment: LineSegment,
    idx: number
) => {
    let startX = currentLineSegment.lineStart.x,
        startY = currentLineSegment.lineStart.y,
        endX = currentLineSegment.lineEnd.x,
        endY = currentLineSegment.lineEnd.y;

    if (idx >= 1) {
        if (
            lineSegments[idx - 1]?.direction === DragHandleType.horizontal &&
            lineSegments[idx]?.direction === DragHandleType.vertical
        ) {
            startX = lineSegments[idx - 1]?.lineEnd?.x ?? 0;
            endX = lineSegments[idx - 1]?.lineEnd?.x ?? 0;
            startY =
                (lineSegments[idx - 1]?.lineEnd?.y ?? 0) -
                (lineSegments[idx - 1]?.snappedHandleOffset ?? 0);
        } else if (
            lineSegments[idx - 1]?.direction === DragHandleType.vertical &&
            lineSegments[idx]?.direction === DragHandleType.horizontal
        ) {
            startY = lineSegments[idx - 1]?.lineEnd?.y ?? 0;
            endY = lineSegments[idx - 1]?.lineEnd?.y ?? 0;
            startX =
                (lineSegments[idx - 1]?.lineEnd?.x ?? 0) -
                (lineSegments[idx - 1]?.snappedHandleOffset ?? 0);
        }
    }
    if (idx < lineSegments.length - 1) {
        if (
            lineSegments[idx + 1]?.direction === DragHandleType.horizontal &&
            lineSegments[idx]?.direction === DragHandleType.vertical
        )
            endY =
                (lineSegments[idx + 1]?.lineStart?.y ?? 0) -
                (lineSegments[idx + 1]?.snappedHandleOffset ?? 0);
        else if (
            lineSegments[idx + 1]?.direction === DragHandleType.vertical &&
            lineSegments[idx]?.direction === DragHandleType.horizontal
        )
            endX =
                (lineSegments[idx + 1]?.lineStart?.x ?? 0) -
                (lineSegments[idx + 1]?.snappedHandleOffset ?? 0);
    }
    return { startX, endX, startY, endY };
};

export const getDraggableHandleProps = (
    lineSegments: LineSegment[],
    lineSegment: LineSegment,
    idx: number,
    setRef: (element: HTMLDivElement | null, key: string) => void
) => {
    const {
        startX, //
        endX,
        startY,
        endY,
    } = alignLineSegments(lineSegments, lineSegment, idx);
    const draggableHandleProps = {
        setRef,
        key: lineSegment.id,
        id: lineSegment.id,
        snappedHandlePoint: lineSegment.snappedHandleOffset,
        startX: startX,
        startY: startY,
        endX: endX,
        endY: endY,
        dragHandleType: lineSegment.direction,
    };
    return draggableHandleProps;
};

export const computeLineSegmentOffset = (lineSegment: LineSegment, change: number) => {
    lineSegment.handleOffset -= change;
    lineSegment.snappedHandleOffset =
        lineSegment.handleOffset - (lineSegment.handleOffset % DEFAULT_DRAG_INTERVAL);
};
