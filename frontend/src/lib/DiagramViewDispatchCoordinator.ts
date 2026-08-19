import { DiagramCanvas } from "#root/interfaces/diagram";
import { app_actions } from "#root/redux/store";
import { getDraftCanvasDrawerState } from "#root/utils/diagram/diagramDraftCanvasDrawerUtil";

import { DiagramViewCanvasResolver } from "./DiagramViewCanvasResolver";
import { DiagramViewInstanceContext } from "./DiagramViewInstanceContext";

export class DiagramViewDispatchCoordinator {
    readonly context: DiagramViewInstanceContext;
    readonly canvasResolver: DiagramViewCanvasResolver;

    constructor(context: DiagramViewInstanceContext, canvasResolver: DiagramViewCanvasResolver) {
        this.context = context;
        this.canvasResolver = canvasResolver;
    }

    clearCanvasView() {
        this.context.listenerApi.dispatch(
            app_actions.diagram.setDraftCanvas({
                instanceId: this.context.instanceId,
                value: undefined,
            })
        );
        this.context.listenerApi.dispatch(
            app_actions.diagram.setOverlayNodes({
                instanceId: this.context.instanceId,
                value: [],
            })
        );
        this.context.listenerApi.dispatch(
            app_actions.diagram.setOverlayEdges({
                instanceId: this.context.instanceId,
                value: [],
            })
        );
    }

    syncView() {
        if (!this.context.hasCanvas()) {
            this.clearCanvasView();
            return;
        }

        const processedDraftCanvas = this.canvasResolver.getProcessedDraftCanvas();
        this.context.listenerApi.dispatch(
            app_actions.diagram.setDraftCanvas({
                instanceId: this.context.instanceId,
                value: processedDraftCanvas,
            })
        );
        this.syncDrawerStateAfterDraftCanvasSet(processedDraftCanvas);

        const overlayNodes = this.canvasResolver.getOverlayNodes(processedDraftCanvas);
        const overlayEdges = this.canvasResolver.getOverlayEdges(processedDraftCanvas);

        this.context.listenerApi.dispatch(
            app_actions.diagram.setOverlayNodes({
                instanceId: this.context.instanceId,
                value: overlayNodes,
            })
        );
        this.context.listenerApi.dispatch(
            app_actions.diagram.setOverlayEdges({
                instanceId: this.context.instanceId,
                value: overlayEdges,
            })
        );
    }

    private syncDrawerStateAfterDraftCanvasSet(processedDraftCanvas?: DiagramCanvas) {
        const nextDrawerState = getDraftCanvasDrawerState({
            currentDrawerState: this.context.diagramState.drawerState,
            draftCanvas: processedDraftCanvas,
        });

        if (!nextDrawerState) {
            return;
        }

        this.context.listenerApi.dispatch(
            app_actions.diagram.setDrawerState({
                instanceId: this.context.instanceId,
                value: nextDrawerState,
            })
        );
    }
}
