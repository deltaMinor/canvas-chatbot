import React from "react";

import { enqueueSnackbar } from "notistack";

import { useDiagramInstanceId } from "#root/contexts/DiagramInstanceContext";
import { useReloadNodeHandleEdgeMappingList } from "#root/hooks/diagram";
import { DiagramNode } from "#root/interfaces/diagram";
import { getBackendProjectDiagramFromStore } from "#root/stores/projectDiagram/backend";
import {
    getDiagramDraftCanvasEdgesFromStore,
    getDiagramDraftCanvasFromStore,
    setDiagramDraftCanvasNodes,
} from "#root/stores/projectDiagram/canvas";
import { getArchitectureNodes } from "#root/utils/diagram/backendDiagramUtil";
import { getProcessedNodes } from "#root/utils/diagram/diagramNodeUtil";

export const useHandleSetProcessedNodes = () => {
    const instanceId = useDiagramInstanceId();
    const reloadNodeHandleEdgeMappingList = useReloadNodeHandleEdgeMappingList();

    return React.useCallback(
        ({
            canvasNodes,
            filterAuthorizedNodes = true,
            filterSelectedViewNodes = true,
            architectureNodes: propsArchitectureNodes,
            skipRefreshNodeHandleEdgeMappingList = false,
        }: {
            canvasNodes: DiagramNode[];
            architectureNodes?: DiagramNode[];
            filterAuthorizedNodes?: boolean;
            filterSelectedViewNodes?: boolean;
            funcRef?: string;
            skipRefreshNodeHandleEdgeMappingList?: boolean;
        }) => {
            try {
                const projectDiagram = getBackendProjectDiagramFromStore();
                const projectDiagramArchitectureNodes = getArchitectureNodes(projectDiagram);
                const contextEdges = getDiagramDraftCanvasEdgesFromStore(instanceId);
                const selectedCanvas = getDiagramDraftCanvasFromStore(instanceId);

                if (!selectedCanvas) return [];

                const architectureNodes = propsArchitectureNodes ?? projectDiagramArchitectureNodes;

                const processedNodes = getProcessedNodes({
                    projectDiagram,
                    canvasNodes,
                    selectedCanvas,
                    architectureNodes,
                    filterAuthorizedNodes,
                    filterSelectedViewNodes,
                });

                setDiagramDraftCanvasNodes(processedNodes as DiagramNode[], instanceId);
                if (!skipRefreshNodeHandleEdgeMappingList) {
                    reloadNodeHandleEdgeMappingList({
                        nodes: processedNodes,
                        edges: contextEdges,
                    });
                }
                return processedNodes;
            } catch (e) {
                enqueueSnackbar(`Failed to set processed nodes. ${e}`, {
                    variant: "error",
                });
                return [];
            }
        },
        [instanceId, reloadNodeHandleEdgeMappingList]
    );
};
