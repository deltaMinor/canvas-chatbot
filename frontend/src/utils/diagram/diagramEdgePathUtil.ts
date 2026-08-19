import { XYPosition } from "@xyflow/react";

import { DragHandleType, LineSegment } from "#root/interfaces/diagram";

// this is used for straight edges and simple smoothstep edges (LTR, RTL, BTT, TTB)
export function getEdgeCenter({
    sourceX,
    sourceY,
    targetX,
    targetY,
}: {
    sourceX: number;
    sourceY: number;
    targetX: number;
    targetY: number;
}): [number, number, number, number] {
    const xOffset = Math.abs(targetX - sourceX) / 2;
    const centerX = targetX < sourceX ? targetX + xOffset : targetX - xOffset;

    const yOffset = Math.abs(targetY - sourceY) / 2;
    const centerY = targetY < sourceY ? targetY + yOffset : targetY - yOffset;

    return [centerX, centerY, xOffset, yOffset];
}

const getSvgPath = (points: XYPosition[]) => {
    const path = points.reduce<string>((res, p, i) => {
        let segment = "";
        segment = `${i === 0 ? "M" : "L"} ${p.x} ${p.y} `;
        res += segment;

        return res;
    }, "");
    return path.trim();
};

const getNewPoint = (
    lineStart: XYPosition,
    lineEnd: XYPosition,
    dragHandleType: DragHandleType,
    point: XYPosition,
    handleOffset: number,
    prevHandleOffset: number,
    nextHandleOffset: number
): XYPosition => {
    let newPoint = point;
    if (Math.abs(point.x - lineStart?.x) < 2 && Math.abs(point.y - lineStart?.y) < 2) {
        if (dragHandleType === DragHandleType.vertical) {
            newPoint = { ...newPoint, x: newPoint.x - handleOffset };
            if (prevHandleOffset) newPoint = { ...newPoint, y: newPoint.y - prevHandleOffset };
        } else {
            newPoint = { ...newPoint, y: newPoint.y - handleOffset };
            if (prevHandleOffset) newPoint = { ...newPoint, x: newPoint.x - prevHandleOffset };
        }
    } else if (Math.abs(newPoint.x - lineEnd?.x) < 2 && Math.abs(newPoint.y - lineEnd?.y) < 2) {
        if (dragHandleType === DragHandleType.vertical) {
            newPoint = { ...newPoint, x: newPoint.x - handleOffset };
            if (nextHandleOffset) newPoint = { ...newPoint, y: newPoint.y - nextHandleOffset };
        } else {
            newPoint = { ...newPoint, y: newPoint.y - handleOffset };
            if (nextHandleOffset) newPoint = { ...newPoint, x: newPoint.x - nextHandleOffset };
        }
    }
    return newPoint;
};

const getPointsWithOffset = (points: XYPosition[], lineSegments: LineSegment[]) => {
    const newPoints = [...points];
    lineSegments.forEach((segment, _idx) => {
        let nextHandleOffset = 0;
        let prevHandleOffset = 0;
        const lineStart = segment?.lineStart;
        const lineEnd = segment?.lineEnd;
        const handleOffset = segment?.snappedHandleOffset;
        const dragHandleType = segment?.direction;

        if (_idx < lineSegments.length - 1)
            nextHandleOffset = lineSegments[_idx + 1]?.snappedHandleOffset ?? 0;

        if (_idx > 0) prevHandleOffset = lineSegments[_idx - 1]?.snappedHandleOffset ?? 0;

        newPoints.forEach((point, idx) => {
            newPoints[idx] = getNewPoint(
                lineStart,
                lineEnd,
                dragHandleType,
                point,
                handleOffset,
                prevHandleOffset,
                nextHandleOffset
            );
        });
    });
    return newPoints;
};

export const getSegmentedSmoothStepPath = ({
    points,
    lineSegments = [],
}: {
    points: XYPosition[];
    lineSegments?: LineSegment[];
}) => {
    if (lineSegments.length > 0) {
        const newPoints = getPointsWithOffset(points, lineSegments);
        return getSvgPath(newPoints);
    } else {
        return getSvgPath(points);
    }
};
