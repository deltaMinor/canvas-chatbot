import React from "react";

import { useActiveEdges, useDiagramHiddenEdgeIds } from "#root/hooks/diagram";
import { DiagramEdge } from "#root/interfaces/diagram";
import { getThreatMappedEdgeVisibilityId } from "#root/utils/diagram/diagramEdgeVisibilityPreferenceUtil";

export const useCanvasEdges = () => {
    const activeEdges = useActiveEdges();
    const hiddenEdgeIds = useDiagramHiddenEdgeIds();

    return React.useMemo(() => {
        const hiddenEdgeIdSet = new Set(hiddenEdgeIds);

        const nextEdges = activeEdges.map((edge: DiagramEdge) => {
            const edgeVisibilityId = getThreatMappedEdgeVisibilityId(edge);

            if (!edgeVisibilityId || !hiddenEdgeIdSet.has(edgeVisibilityId)) {
                return edge;
            }

            return {
                ...edge,
                hidden: true,
            };
        });

        return nextEdges;
    }, [activeEdges, hiddenEdgeIds]);
};
