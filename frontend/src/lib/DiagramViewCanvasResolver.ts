import { defaultViewport } from "#root/constants/diagramConfig";
import { CanvasType, DiagramCanvas, DiagramEdge, DiagramNode } from "#root/interfaces/diagram";
import { getUpdatedDFCanvas } from "#root/utils/diagram/diagramCanvasUtil";
import { getProcessedEdges } from "#root/utils/diagram/diagramEdgeUtil";
import { getProcessedNodes } from "#root/utils/diagram/diagramNodeUtil";

import { DiagramViewInstanceContext } from "./DiagramViewInstanceContext";

export class DiagramViewCanvasResolver {
    readonly context: DiagramViewInstanceContext;

    constructor(context: DiagramViewInstanceContext) {
        this.context = context;
    }

    private createVirtualDraftCanvas(canvasType: CanvasType.summary): DiagramCanvas {
        return {
            canvas_id: canvasType.toString(),
            canvas_name: "Summary",
            canvas_type: canvasType,
            llm_generation_status: 0,
            ref: null as unknown as DiagramCanvas["ref"],
            view_only: true,
            warnings: [],
            nodes: [],
            edges: [],
            viewport: defaultViewport,
        };
    }

    private resolveSourceDraftCanvas() {
        if (this.context.currentDraftCanvasId === CanvasType.summary.toString()) {
            return this.createVirtualDraftCanvas(CanvasType.summary);
        }

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

        if (sourceDraftCanvas.canvas_type === CanvasType.architecture) {
            return sourceDraftCanvas;
        }

        if (sourceDraftCanvas.canvas_type === CanvasType.data_flow) {
            const renderedDataFlowCanvas =
                getUpdatedDFCanvas(
                    this.context.projectDiagram,
                    this.context.architectureCanvas ?? ({} as DiagramCanvas),
                    sourceDraftCanvas.canvas_id
                ) ?? sourceDraftCanvas;

            return renderedDataFlowCanvas;
        }

        if (sourceDraftCanvas.canvas_type === CanvasType.summary) {
            const renderedSummaryCanvas = {
                ...(this.context.summaryData?.summary_canvas ?? sourceDraftCanvas),
            };

            return renderedSummaryCanvas;
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

        let overlayNodes: DiagramCanvas["nodes"] = [];
        switch (processedDraftCanvas.canvas_type) {
            case CanvasType.summary:
            case CanvasType.data_flow:
                overlayNodes = this.context.architectureCanvas?.nodes ?? [];
                break;
            case CanvasType.architecture:
            default:
                overlayNodes = [];
                break;
        }

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

        switch (processedDraftCanvas.canvas_type) {
            case CanvasType.summary:
            case CanvasType.data_flow:
            case CanvasType.architecture:
            default:
                return processedOverlayNodes;
        }
    }

    getOverlayEdges(processedDraftCanvas?: DiagramCanvas) {
        if (!processedDraftCanvas || !this.context.projectDiagram) {
            return [];
        }

        let overlayEdges: DiagramEdge[] = [];
        switch (processedDraftCanvas.canvas_type) {
            case CanvasType.summary:
            case CanvasType.data_flow:
                overlayEdges = this.context.architectureCanvas?.edges ?? [];
                break;
            case CanvasType.architecture:
            default:
                overlayEdges = [];
                break;
        }

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
