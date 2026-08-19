import { ListenerApiLike } from "#root/interfaces/diagramViewInstanceResolver";

import { DiagramViewCanvasResolver } from "./DiagramViewCanvasResolver";
import { DiagramViewDispatchCoordinator } from "./DiagramViewDispatchCoordinator";
import { DiagramViewInstanceContext } from "./DiagramViewInstanceContext";

export class DiagramViewInstanceResolver {
    readonly context: DiagramViewInstanceContext;
    readonly canvasResolver: DiagramViewCanvasResolver;
    readonly dispatchCoordinator: DiagramViewDispatchCoordinator;

    constructor({
        listenerApi, //
        instanceId,
    }: {
        listenerApi: ListenerApiLike;
        instanceId: string;
    }) {
        this.context = new DiagramViewInstanceContext({
            listenerApi,
            instanceId,
        });
        this.canvasResolver = new DiagramViewCanvasResolver(
            this.context //
        );
        this.dispatchCoordinator = new DiagramViewDispatchCoordinator(
            this.context,
            this.canvasResolver
        );
    }

    syncView() {
        this.dispatchCoordinator.syncView();
    }
}
