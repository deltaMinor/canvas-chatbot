import { enqueueSnackbar } from "notistack";

import { DiagramEdge, DiagramNode, LineSegment } from "#root/interfaces/diagram";
import { LineSegmentResolver } from "#root/lib/LineSegmentResolver";
import {
    getDiagramDraftCanvasTypeFromStore,
    getDiagramNodeHandleEdgeMappingFromStore,
} from "#root/stores/projectDiagram/canvas";
import { setDiagramLineSegments } from "#root/stores/projectDiagram/draggableEdge";
import { getFilteredCanvasNodesOrEdges } from "#root/utils/diagram";

import { getChildNodesRecursive } from "./diagramCanvasNodeGroupUtil";

export const updateLineSegments = ({
    instanceId,
    allNodes,
    canvasNodes,
    changedNode,
    edges,
}: {
    instanceId: string;
    allNodes: DiagramNode[];
    canvasNodes: DiagramNode[];
    changedNode: DiagramNode;
    edges: DiagramEdge[];
}) => {
    const selectedCanvasType = getDiagramDraftCanvasTypeFromStore(instanceId);
    const nodeHandleEdgeMapping = getDiagramNodeHandleEdgeMappingFromStore(instanceId);

    const childNodes = getChildNodesRecursive(changedNode, canvasNodes) || [];
    const nodeIdList = [changedNode.id, ...childNodes.map((node) => node.id)];
    const canvasEdges = getFilteredCanvasNodesOrEdges<DiagramEdge>(edges, selectedCanvasType);
    const resolver = new LineSegmentResolver(allNodes, nodeHandleEdgeMapping);
    const lineSegments = canvasEdges
        .filter((edge) => nodeIdList.includes(edge.target) || nodeIdList.includes(edge.source))
        .reduce(
            (acc, edge) => {
                acc[edge.id] = resolver.computeLineSegments({ edge }) || [];
                return acc;
            },
            {} as Record<string, LineSegment[]>
        );

    setDiagramLineSegments((prev) => ({ ...prev, ...lineSegments }), instanceId);
};

export const openAuthorizationWarningSnackbar = () => {
    enqueueSnackbar("Not authorized.", {
        variant: "warning",
    });
};

export const initResizeObserver = () => {
    window.addEventListener("error", (event) => {
        if (event.message === "ResizeObserver loop limit exceeded") {
            const resizeObserverErrDiv = document.getElementById(
                "webpack-dev-server-client-overlay-div"
            );
            const resizeObserverErr = document.getElementById("webpack-dev-server-client-overlay");
            if (resizeObserverErr) {
                resizeObserverErr.setAttribute("style", "display: none");
            }
            if (resizeObserverErrDiv) {
                resizeObserverErrDiv.setAttribute("style", "display: none");
            }
        }
    });
};
