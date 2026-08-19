import React from "react";

import { useReactFlow } from "@xyflow/react";

import { useDraggableEdgeActions } from "#root/hooks/diagram";
import { DiagramEdge, DiagramNode, LineSegment } from "#root/interfaces/diagram";

interface UseInitDraggableEdgeLineSegmentsEffectParams {
    currentLineSegments: LineSegment[];
    id: string;
}

export const useInitDraggableEdgeLineSegmentsEffect = ({
    currentLineSegments,
    id,
}: UseInitDraggableEdgeLineSegmentsEffectParams) => {
    const { getEdges } = useReactFlow<DiagramNode, DiagramEdge>();
    const { handleUpdateSingleEdgeLineSegments } = useDraggableEdgeActions();

    React.useEffect(() => {
        const allEdges = getEdges();

        if (!allEdges.length || currentLineSegments.length) {
            return;
        }

        const initializedSegments =
            allEdges.find((edge) => edge.id === id)?.data?.lineSegments ?? [];

        if (initializedSegments.length) {
            handleUpdateSingleEdgeLineSegments(id, initializedSegments);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
};

export default useInitDraggableEdgeLineSegmentsEffect;
