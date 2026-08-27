import { DiagramCanvas, DiagramEdge, DiagramNode } from "#root/interfaces/diagram";
import { getProcessedEdges } from "#root/utils/diagram/diagramEdgeUtil";
import { getProcessedNodes } from "#root/utils/diagram/diagramNodeUtil";

import { DiagramViewInstanceContext } from "./DiagramViewInstanceContext";

export class DiagramViewCanvasResolver {
    readonly context: DiagramViewInstanceContext;

    constructor(context: DiagramViewInstanceContext) {
        this.context = context;
    }

    private resolveSourceDraftCanvas() {
        return this.context.projectDiagram?.canvas.find(
            (canvas) => canvas.canvas_id === this.context.currentDraftCanvasId
        );
    }

    private getEffectiveThreatOverviewScenarioScope() {
        return this.context.threatOverviewScenarioScope;
    }

    private shouldFilterSelectedViewNodes() {
        return true;
    }

    private clearSelectedState<T extends { selected?: boolean }>(elements: T[] = []): T[] {
        return elements.map((element) => ({
            ...element,
            selected: false,
        }));
    }

    private getRenderedDraftCanvas() {
        const sourceDraftCanvas = this.resolveSourceDraftCanvas();

        if (!sourceDraftCanvas || !this.context.projectDiagram) {
            return undefined;
        }

        return sourceDraftCanvas;
    }

    getProcessedDraftCanvas() {
        const draftCanvas = this.getRenderedDraftCanvas();

        if (!draftCanvas || !this.context.projectDiagram) {
            return undefined;
        }

        const processedNodes = this.clearSelectedState<DiagramNode>(
            getProcessedNodes({
                projectDiagram: this.context.projectDiagram,
                canvasNodes: draftCanvas.nodes ?? [],
                selectedCanvas: draftCanvas,
                threatOverviewScenarioScope: this.getEffectiveThreatOverviewScenarioScope(),
                visibleThreatScenarioCanvasIds: this.context.visibleThreatScenarioCanvasIds,
                architectureNodes: [],
                filterAuthorizedNodes: true,
                filterSelectedViewNodes: this.shouldFilterSelectedViewNodes(),
                selectedPath: this.context.selectedPath,
                viewAllPaths: this.context.diagramState.viewAllPaths,
            })
        );
        const processedEdges = this.clearSelectedState<DiagramEdge>(
            getProcessedEdges({
                projectDiagram__isAuthorized: this.context.projectDiagramIsAuthorized,
                projectDiagram: this.context.projectDiagram,
                canvasEdges: draftCanvas.edges ?? [],
                selectedCanvas: draftCanvas,
                threatOverviewScenarioScope: this.getEffectiveThreatOverviewScenarioScope(),
                visibleThreatScenarioCanvasIds: this.context.visibleThreatScenarioCanvasIds,
                architectureEdges: [],
                filterAuthorizedEdges: true,
                filterSelectedViewEdges: true,
                selectedPath: this.context.selectedPath,
                viewAllPaths: this.context.diagramState.viewAllPaths,
            })
        );

        const processedDraftCanvas = {
            ...draftCanvas,
            nodes: processedNodes,
            edges: processedEdges,
        };

        return processedDraftCanvas;
    }

    getOverlayNodes(processedDraftCanvas?: DiagramCanvas) {
        if (!processedDraftCanvas?.canvas_type || !this.context.projectDiagram) {
            return [];
        }

        const overlayNodes: DiagramCanvas["nodes"] = [];

        const processedOverlayNodes = this.clearSelectedState<DiagramNode>(
            getProcessedNodes({
                projectDiagram: this.context.projectDiagram,
                canvasNodes: overlayNodes,
                selectedCanvas: processedDraftCanvas,
                visibleThreatScenarioCanvasIds: this.context.visibleThreatScenarioCanvasIds,
                threatOverviewScenarioScope: this.getEffectiveThreatOverviewScenarioScope(),
                architectureNodes: [],
                filterAuthorizedNodes: true,
                filterSelectedViewNodes: this.shouldFilterSelectedViewNodes(),
                selectedPath: this.context.selectedPath,
                viewAllPaths: this.context.diagramState.viewAllPaths,
            })
        );

        return processedOverlayNodes;
    }

    getOverlayEdges(processedDraftCanvas?: DiagramCanvas) {
        if (!processedDraftCanvas || !this.context.projectDiagram) {
            return [];
        }

        const overlayEdges: DiagramEdge[] = [];

        const processedOverlayEdges = this.clearSelectedState<DiagramEdge>(
            getProcessedEdges({
                projectDiagram__isAuthorized: this.context.projectDiagramIsAuthorized,
                projectDiagram: this.context.projectDiagram,
                canvasEdges: overlayEdges,
                selectedCanvas: processedDraftCanvas,
                threatOverviewScenarioScope: this.getEffectiveThreatOverviewScenarioScope(),
                visibleThreatScenarioCanvasIds: this.context.visibleThreatScenarioCanvasIds,
                architectureEdges: [],
                filterAuthorizedEdges: true,
                filterSelectedViewEdges: true,
                selectedPath: this.context.selectedPath,
                viewAllPaths: this.context.diagramState.viewAllPaths,
            })
        );

        return processedOverlayEdges;
    }
}
