import React from "react";

import { enqueueSnackbar } from "notistack";

import { useDiagramInstanceId } from "#root/contexts/DiagramInstanceContext";
import { useReloadNodeHandleEdgeMappingList } from "#root/hooks/diagram";
import { DiagramEdge } from "#root/interfaces/diagram";
import { getProjectDiagramIsAuthorizedFromStore } from "#root/stores/backendAuthStore";
import { getProjectDiagramFromStore } from "#root/stores/backendStore";
import {
    getDiagramDraftCanvasFromStore,
    getDiagramDraftCanvasNodesFromStore,
    setDiagramDraftCanvasEdges,
} from "#root/stores/projectDiagram/canvas";
import { getArchitectureEdges } from "#root/utils/diagram/backendDiagramUtil";
import { getProcessedEdges } from "#root/utils/diagram/diagramEdgeUtil";

export const useHandleSetProcessedEdges = () => {
    const instanceId = useDiagramInstanceId();
    const reloadNodeHandleEdgeMappingList = useReloadNodeHandleEdgeMappingList();

    return React.useCallback(
        ({
            canvasEdges,
            filterAuthorizedEdges = true,
            filterSelectedViewEdges = true,
            architectureEdges: propsArchitectureEdges,
            skipRefreshNodeEdgeMappingList = false,
        }: {
            canvasEdges: DiagramEdge[];
            architectureEdges?: DiagramEdge[];
            filterAuthorizedEdges?: boolean;
            filterSelectedViewEdges?: boolean;
            funcRef?: string;
            skipRefreshNodeEdgeMappingList?: boolean;
        }) => {
            try {
                const projectDiagram = getProjectDiagramFromStore();
                const projectDiagramArchitectureEdges = getArchitectureEdges(projectDiagram);
                const projectDiagramIsAuthorized = getProjectDiagramIsAuthorizedFromStore();
                const selectedCanvas = getDiagramDraftCanvasFromStore(instanceId);
                const nodes = getDiagramDraftCanvasNodesFromStore(instanceId);

                if (!selectedCanvas || !projectDiagram) return [];

                const architectureEdges = propsArchitectureEdges ?? projectDiagramArchitectureEdges;

                const processedEdges = getProcessedEdges({
                    projectDiagram__isAuthorized: projectDiagramIsAuthorized,
                    projectDiagram,
                    canvasEdges,
                    selectedCanvas,
                    architectureEdges,
                    filterAuthorizedEdges,
                    filterSelectedViewEdges,
                });

                setDiagramDraftCanvasEdges(processedEdges, instanceId);
                if (!skipRefreshNodeEdgeMappingList) {
                    reloadNodeHandleEdgeMappingList({
                        nodes,
                        edges: processedEdges,
                    });
                }
                return processedEdges;
            } catch (e) {
                enqueueSnackbar(`Failed to set processed edges. ${e}`, {
                    variant: "error",
                });
                return [];
            }
        },
        [instanceId, reloadNodeHandleEdgeMappingList]
    );
};
