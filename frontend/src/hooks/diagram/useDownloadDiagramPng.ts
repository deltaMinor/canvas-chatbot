import React from "react";

import { Viewport, getViewportForBounds, useReactFlow } from "@xyflow/react";
import { toPng } from "html-to-image";

import { useDiagramInstanceId } from "#root/contexts/DiagramInstanceContext";
import { DiagramEdge, DiagramNode } from "#root/interfaces/diagram";
import { getDiagramDraftCanvasTypeFromStore } from "#root/stores/projectDiagram/canvas";
import {
    getActiveEdgesFromStore,
    getActiveNodesFromStore,
} from "#root/stores/projectDiagram/selection";
import { getDiagramHiddenEdgeIdsFromStore } from "#root/stores/projectDiagram/visibility";
import { getThreatMappedEdgeVisibilityId } from "#root/utils/diagram/diagramEdgeVisibilityPreferenceUtil";
import { downloadImage } from "#root/utils/diagram/diagramExportUtil";

const imageWidth = 1920;
const imageHeight = 1080;
const imagePadding = 0.08;

const getCanvasNodesForExport = (instanceId: string) => getActiveNodesFromStore(instanceId);

const getCanvasEdgesForExport = (instanceId: string) => {
    const activeEdges = getActiveEdgesFromStore(instanceId);
    const hiddenEdgeIdSet = new Set(getDiagramHiddenEdgeIdsFromStore(instanceId));

    return activeEdges.map((edge) => {
        const edgeVisibilityId = getThreatMappedEdgeVisibilityId(edge);

        if (!edgeVisibilityId || !hiddenEdgeIdSet.has(edgeVisibilityId)) {
            return edge;
        }

        return {
            ...edge,
            hidden: true,
        };
    });
};

export const useDownloadDiagramPng = () => {
    const instanceId = useDiagramInstanceId();
    const reactFlow = useReactFlow<DiagramNode, DiagramEdge>();

    return React.useCallback(async () => {
        const nodes = getCanvasNodesForExport(instanceId);
        const edges = getCanvasEdgesForExport(instanceId);
        const selectedCanvasType = getDiagramDraftCanvasTypeFromStore(instanceId) ?? "unknown";

        if (!nodes.length && !edges.length) {
            return;
        }

        const { getNodesBounds } = reactFlow;
        const nodesBounds = getNodesBounds(nodes);
        const transform: Viewport = getViewportForBounds(
            nodesBounds,
            imageWidth,
            imageHeight,
            0.5,
            2,
            imagePadding
        );
        const imageName = `project_diagram--${selectedCanvasType}_view.png`;

        const element = document.querySelector(".react-flow__viewport") as HTMLElement | null;
        if (!element) {
            return;
        }

        // Wait for fonts if they are not ready
        await document.fonts.ready;

        const dataUrl = await toPng(element, {
            backgroundColor: "#fff",
            width: imageWidth,
            height: imageHeight,
            style: {
                width: `${imageWidth}`,
                height: `${imageHeight}`,
                transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.zoom})`,
            },
            cacheBust: true,
            filter: (domNode) => {
                return !domNode.classList?.contains("react-flow__handle");
            },
        });

        downloadImage(dataUrl, imageName);
    }, [instanceId, reactFlow]);
};

export default useDownloadDiagramPng;
