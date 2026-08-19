import React from "react";

import { useNodeHandleEdgeMappingResolver } from "#root/hooks/diagram";
import { DiagramEdge, DiagramNode, NodeHandleEdgeMappingDict } from "#root/interfaces/diagram";

export const useReloadNodeHandleEdgeMappingList = (): ((params?: {
    nodes?: DiagramNode[];
    edges?: DiagramEdge[];
}) => NodeHandleEdgeMappingDict) => {
    const nodeHandleEdgeMappingResolver = useNodeHandleEdgeMappingResolver();

    return React.useCallback(
        ({
            nodes,
            edges,
        }: {
            nodes?: DiagramNode[];
            edges?: DiagramEdge[];
        } = {}) => {
            const refreshParams: {
                nodes?: DiagramNode[];
                edges?: DiagramEdge[];
            } = {};

            if (nodes) refreshParams.nodes = nodes;
            if (edges) refreshParams.edges = edges;

            return nodeHandleEdgeMappingResolver.refresh(refreshParams);
        },
        [nodeHandleEdgeMappingResolver]
    );
};
