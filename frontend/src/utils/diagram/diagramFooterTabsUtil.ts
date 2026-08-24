import { CanvasType } from "#root/enums/diagram";
import { DiagramCanvas } from "#root/interfaces/diagram";
import app_store, { app_actions } from "#root/redux/store";
import { getProjectDiagramFromStore } from "#root/stores/backendStore";
import {
    getDiagramSelectedTabGroupFromStore,
    setDiagramSelectedDataflowCanvasId,
} from "#root/stores/projectDiagram/canvas";

const previousSelectedTabGroupByInstance = new Map<string, string>();
const pendingSelectedTabGroupByInstance = new Map<string, string>();
const transitionTimeoutByInstance = new Map<string, ReturnType<typeof setTimeout>>();

export const evalIsNodeCardFieldMissing = ({ canvas }: { canvas: DiagramCanvas[] }) => {
    const dfCanvasList = canvas?.filter(
        (item) => item.canvas_type === CanvasType.data_flow.toString()
    );
    let missing = false;

    dfCanvasList.forEach((dfCanvas) => {
        if (missing) return;
        dfCanvas.nodes.forEach((node) => {
            if (missing) return;
            if (
                node.data?.cardFieldOptionId === undefined ||
                node.data?.cardFieldOptionIdAssoc === undefined
            ) {
                missing = true;
            }
        });
    });

    return missing;
};

export const processTabTransitionEnd = ({ instanceId }: { instanceId: string }) => {
    const projectDiagram = getProjectDiagramFromStore();
    const architectureCanvas = projectDiagram?.canvas?.find((canvas) => {
        return canvas?.canvas_type === CanvasType.architecture;
    });
    const selectedTabGroup = getDiagramSelectedTabGroupFromStore(instanceId);
    const previousSelectedTabGroup =
        previousSelectedTabGroupByInstance.get(instanceId) ?? CanvasType.architecture;

    const pendingSelectedTabGroup = pendingSelectedTabGroupByInstance.get(instanceId);

    if (
        selectedTabGroup === previousSelectedTabGroup ||
        selectedTabGroup === pendingSelectedTabGroup
    ) {
        return;
    }

    const dfCanvasList = projectDiagram?.canvas?.filter(
        (canvas) => canvas.canvas_type === CanvasType.data_flow.toString()
    );
    const firstDataflowCanvasId = dfCanvasList?.[0]?.canvas_id || "";

    const pendingTimeout = transitionTimeoutByInstance.get(instanceId);
    if (pendingTimeout) {
        clearTimeout(pendingTimeout);
    }
    pendingSelectedTabGroupByInstance.set(instanceId, selectedTabGroup);

    app_store.dispatch(app_actions.diagram.setInTransition(true));
    const transitionTimeout = setTimeout(() => {
        let nextDraftCanvasId = "";

        if (selectedTabGroup === CanvasType.architecture.toString()) {
            nextDraftCanvasId = architectureCanvas?.canvas_id || "";
            setDiagramSelectedDataflowCanvasId(firstDataflowCanvasId, instanceId);
            app_store.dispatch(
                app_actions.diagram.setDraftCanvasId({
                    instanceId,
                    value: nextDraftCanvasId,
                })
            );
        } else if (selectedTabGroup === CanvasType.data_flow.toString()) {
            nextDraftCanvasId = firstDataflowCanvasId;
            setDiagramSelectedDataflowCanvasId(firstDataflowCanvasId, instanceId);
            app_store.dispatch(
                app_actions.diagram.setDraftCanvasId({
                    instanceId,
                    value: nextDraftCanvasId,
                })
            );
        } else if (selectedTabGroup === CanvasType.summary.toString()) {
            nextDraftCanvasId = CanvasType.summary.toString();
            setDiagramSelectedDataflowCanvasId(firstDataflowCanvasId, instanceId);
            app_store.dispatch(
                app_actions.diagram.setDraftCanvasId({
                    instanceId,
                    value: nextDraftCanvasId,
                })
            );
        }

        previousSelectedTabGroupByInstance.set(instanceId, selectedTabGroup);
        pendingSelectedTabGroupByInstance.delete(instanceId);
        transitionTimeoutByInstance.delete(instanceId);
        app_store.dispatch(app_actions.diagram.setInTransition(false));
    }, 200);
    transitionTimeoutByInstance.set(instanceId, transitionTimeout);
};
