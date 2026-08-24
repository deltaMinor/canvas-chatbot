import { ListenerApiLike } from "#root/interfaces/diagramViewInstanceResolver";
import { RootState } from "#root/redux/store";
import {
    selectBackendProjectDiagram,
    selectBackendProjectDiagramIsAuthorized,
} from "#root/selectors/backendSelectors";
import { getArchitectureCanvas } from "#root/utils/diagram/backendDiagramUtil";
import { getDiagramInstanceState } from "#root/utils/diagram/diagramInstanceUtil";
import { getActiveThreatScenarioSelection } from "#root/utils/diagram/diagramSelectionUtil";

export class DiagramViewInstanceContext {
    readonly listenerApi: ListenerApiLike;
    readonly instanceId: string;
    private _summaryData: undefined = undefined;
    private _summaryDataCacheKey = "";

    constructor({
        listenerApi, //
        instanceId,
    }: {
        listenerApi: ListenerApiLike;
        instanceId: string;
    }) {
        this.listenerApi = listenerApi;
        this.instanceId = instanceId;
    }

    get state() {
        return this.listenerApi.getState() as RootState;
    }

    get projectDiagram() {
        return selectBackendProjectDiagram(this.state);
    }

    get projectDiagramIsAuthorized() {
        return selectBackendProjectDiagramIsAuthorized(this.state);
    }

    get architectureCanvas() {
        return getArchitectureCanvas(this.projectDiagram);
    }

    get diagramState() {
        return getDiagramInstanceState(this.state, this.instanceId);
    }

    get activeThreatScenarioContext() {
        return getActiveThreatScenarioSelection({
            projectDiagram: this.projectDiagram,
            draftCanvasId: this.currentDraftCanvasId,
            selectedPathId: this.diagramState.selectedPathId,
        });
    }

    get selectedPath() {
        return this.activeThreatScenarioContext.selectedPath;
    }

    get currentDraftCanvasId() {
        return this.diagramState.draftCanvasId;
    }

    get currentDraftCanvasType() {
        return this.projectDiagram?.canvas.find(
            (canvas) => canvas.canvas_id === this.currentDraftCanvasId
        )?.canvas_type;
    }

    get visibleThreatScenarioCanvasIds() {
        return this.diagramState.visibleThreatScenarioCanvasIds ?? [];
    }

    get threatOverviewScenarioScope() {
        return this.diagramState.threatOverviewScenarioScope ?? "top5";
    }

    get summaryData() {
        const cacheKey = [
            this.currentDraftCanvasId,
            this.currentDraftCanvasType ?? "",
            this.projectDiagram?.["project_id"] ?? "no-project-diagram",
        ].join("|");

        if (this._summaryDataCacheKey !== cacheKey) {
            this._summaryData = undefined;
            this._summaryDataCacheKey = cacheKey;
        }

        return this._summaryData;
    }

    hasCanvas() {
        return !!this.projectDiagram?.canvas?.length;
    }
}
