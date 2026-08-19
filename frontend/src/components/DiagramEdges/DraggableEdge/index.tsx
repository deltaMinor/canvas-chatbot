import React from "react";

import { BaseEdge, EdgeLabelRenderer, EdgeProps } from "@xyflow/react";

import DiagramDraggableEdgeEffects from "#root/effects/DiagramDraggableEdgeEffects";
import {
    useDiagramDraftCanvasType,
    useDiagramDraftCanvasViewOnly,
    useDiagramEdgeSegmentedPath,
    useDiagramLineSegments,
    useDragHandleRefs,
} from "#root/hooks/diagram";
import { DiagramEdge } from "#root/interfaces/diagram";
import { getDraggableHandleProps } from "#root/utils/diagram/diagramDraggableEdgeUtil";
import { getBaseEdgeProps } from "#root/utils/diagram/diagramEdgeUtil";

import DraggableHandle from "./DraggableHandle";

const DraggableEdgeComponent = (
    edgeProps: EdgeProps<DiagramEdge> //
) => {
    const {
        baseEdgeProps,
        id,
        sourceHandleId,
        targetHandleId,
        sourceX,
        sourceY,
        targetX,
        targetY,
    } = getBaseEdgeProps(edgeProps);

    const lineSegments = useDiagramLineSegments();
    const selectedCanvasType = useDiagramDraftCanvasType();
    const selectedCanvasViewOnly = useDiagramDraftCanvasViewOnly();
    const { setRef } = useDragHandleRefs();

    // Hooked variables
    const isInSelectedCanvas = React.useMemo(() => {
        const edgeDataType = baseEdgeProps?.data?.["type"];
        return edgeDataType === selectedCanvasType;
    }, [baseEdgeProps?.data, selectedCanvasType]);
    const currentLineSegments = React.useMemo(
        () => lineSegments[id] ?? [],
        [
            lineSegments, //
            id,
        ]
    );
    const segmentedPath = useDiagramEdgeSegmentedPath(id);

    return (
        <>
            <DiagramDraggableEdgeEffects
                currentLineSegments={currentLineSegments}
                id={id}
                sourceHandleId={sourceHandleId}
                sourceX={sourceX}
                sourceY={sourceY}
                targetHandleId={targetHandleId}
                targetX={targetX}
                targetY={targetY}
            />
            <BaseEdge //
                {...baseEdgeProps}
                key={id}
                id={id}
                path={segmentedPath}
            />
            {import.meta.env["NODE_ENV"] === "development" && (
                <EdgeLabelRenderer>
                    {!selectedCanvasViewOnly && isInSelectedCanvas && currentLineSegments ? (
                        Array.from(currentLineSegments).map((lineSegment, idx) => {
                            const { key, ...draggableHandleProps } = getDraggableHandleProps(
                                currentLineSegments,
                                lineSegment,
                                idx,
                                setRef
                            );
                            return (
                                <DraggableHandle
                                    key={key} //
                                    {...draggableHandleProps}
                                />
                            );
                        })
                    ) : (
                        <></>
                    )}
                </EdgeLabelRenderer>
            )}
        </>
    );
};

export default React.memo(DraggableEdgeComponent);
