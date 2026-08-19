import React from "react";

import { DEFAULT_LINE_SEGMENT_THICKNESS, DEFAULT_ZINDEX_EDGE } from "#root/constants/diagram";
import { DragHandleType } from "#root/interfaces/diagram";

interface DraggableHandleProps {
    key: string;
    id: string;
    edgeRef?: React.RefObject<HTMLDivElement>;
    snappedHandlePoint: number;
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    lineLength?: number;
    dragHandleType: DragHandleType;
    setRef: (element: HTMLDivElement | null, key: string) => void;
}
const DraggableHandleComponent: React.FC<DraggableHandleProps> = (
    draggableHandleProps: DraggableHandleProps //
) => {
    const { id, snappedHandlePoint, startX, startY, endX, endY, dragHandleType, setRef } =
        draggableHandleProps;
    return dragHandleType === DragHandleType.vertical ? (
        <div
            key={id}
            ref={(element) => {
                setRef(element, id);
            }}
            style={{
                position: "absolute",
                left: `${startX - snappedHandlePoint}px`,
                top: `${Math.min(startY, endY)}px`,
                zIndex: DEFAULT_ZINDEX_EDGE * 50,
                opacity: 0,
                width: `${DEFAULT_LINE_SEGMENT_THICKNESS}px`,
                height: `${Math.abs(endY - startY)}px`,
                pointerEvents: "all",
                borderRadius: "50%",
                background: "black",
                cursor: "e-resize",
            }}
        />
    ) : (
        <div
            key={id}
            ref={(element) => {
                setRef(element, id);
            }}
            style={{
                position: "absolute",
                left: `${Math.min(startX, endX)}px`,
                top: `${startY - snappedHandlePoint}px`,
                zIndex: DEFAULT_ZINDEX_EDGE * 50,
                opacity: 0,
                width: `${Math.abs(endX - startX)}px`,
                height: `${DEFAULT_LINE_SEGMENT_THICKNESS}px`,
                pointerEvents: "all",
                borderRadius: "50%",
                background: "black",
                cursor: "n-resize",
            }}
        />
    );
};
export default DraggableHandleComponent;
