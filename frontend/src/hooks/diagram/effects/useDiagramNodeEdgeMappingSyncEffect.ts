import React from "react";

import { useActiveEdges, useActiveNodes } from "../projectDiagramFeatureHooks";
import { useReloadNodeHandleEdgeMappingList } from "../useReloadNodeHandleEdgeMappingList";

export const useDiagramNodeEdgeMappingSyncEffect = () => {
    const activeNodes = useActiveNodes();
    const activeEdges = useActiveEdges();
    const reloadNodeHandleEdgeMappingList = useReloadNodeHandleEdgeMappingList();

    const activeNodeSignature = React.useMemo(
        () =>
            activeNodes
                .map((node) => `${node.id}|${node.type || ""}|${String(node.hidden ?? false)}`)
                .sort()
                .join(","),
        [activeNodes]
    );

    const activeEdgeSignature = React.useMemo(
        () =>
            activeEdges
                .map((edge) =>
                    [
                        edge.id,
                        edge.source,
                        edge.sourceHandle || "",
                        edge.target,
                        edge.targetHandle || "",
                        edge.type || "",
                    ].join("|")
                )
                .sort()
                .join(","),
        [activeEdges]
    );

    React.useEffect(() => {
        reloadNodeHandleEdgeMappingList({
            nodes: activeNodes,
            edges: activeEdges,
        });
    }, [
        activeEdgeSignature,
        activeEdges,
        activeNodeSignature,
        activeNodes,
        reloadNodeHandleEdgeMappingList,
    ]);
};
