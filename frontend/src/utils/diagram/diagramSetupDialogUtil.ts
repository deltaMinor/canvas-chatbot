import { DiagramCanvas, ProjectDiagram } from "#root/interfaces/diagram";
import { HandleSetProcessedNodesAndEdges } from "#root/interfaces/diagramContent";
import app_store, { app_actions } from "#root/redux/store";
import { postGenerateDiagramFromCacti } from "#root/services/domain/diagram";
import { refreshProjectDiagram } from "#root/stores/backendRefreshStore";
import { getProjectCactiFromStore, getProjectIdFromStore } from "#root/stores/backendStore";
import { setDiagramDraftCanvas, setDiagramDraftCanvasId } from "#root/stores/projectDiagram/canvas";
import { updateProjectDiagram } from "#root/stores/projectDiagramFeaturePersistenceStore";
import { getInitCanvasId, reloadCanvas } from "#root/utils/diagram/diagramCanvasUtil";

export const handleUpdateCanvas = async ({
    projectDiagram,
}: {
    projectDiagram: ProjectDiagram;
}) => {
    updateProjectDiagram(projectDiagram);
};

export const processImportDiagram = async ({
    instanceId,
    projectDiagram,
    handleSetProcessedNodesAndEdges,
}: {
    instanceId: string;
    projectDiagram: ProjectDiagram;
    handleSetProcessedNodesAndEdges: HandleSetProcessedNodesAndEdges;
}) => {
    const setSelectedCanvas = (value: React.SetStateAction<DiagramCanvas | undefined>) =>
        setDiagramDraftCanvas(value, instanceId);

    app_store.dispatch(app_actions.backend.setProjectDiagram(projectDiagram));

    const draftCanvasId = getInitCanvasId({
        canvas: projectDiagram.canvas,
    });
    // NOTE: previously dispatched `app_actions.diagram.setDraftCanvasId(draftCanvasId)`
    // directly with a bare string. That reducer scopes its state per diagram
    // instance, and a bare (non-`{instanceId, value}`) payload resolves to a
    // *default* instance id rather than this specific `instanceId` - so the
    // real editor instance's `draftCanvasId` was silently left pointing at
    // whatever canvas was selected before the import (which import had just
    // replaced with a freshly generated canvas_id). That's why the canvas
    // never actually swapped to the imported one, and why looking up that
    // stale canvas's viewport afterward failed with "No canvas viewport."
    // `setDiagramDraftCanvasId` is the existing helper that correctly scopes
    // the update to `instanceId`, matching `setSelectedCanvas` above.
    setDiagramDraftCanvasId(draftCanvasId, instanceId);

    const selectedCanvas = projectDiagram.canvas?.find((canvas) => {
        return canvas?.canvas_id === draftCanvasId;
    });
    setSelectedCanvas(selectedCanvas);

    if (!selectedCanvas) {
        return;
    }

    reloadCanvas({
        selectedCanvas,
        selectedCanvasType: selectedCanvas.canvas_type,
        projectDiagram,
        handleSetProcessedNodesAndEdges,
    });
};

export const processClickGenerateDiagramFromCacti = async ({
    instanceId,
    handleSetProcessedNodesAndEdges,
}: {
    instanceId: string;
    handleSetProcessedNodesAndEdges: HandleSetProcessedNodesAndEdges;
}) => {
    const projectDiagramFileCacti = getProjectCactiFromStore();

    const project_id = getProjectIdFromStore();
    const selected_cacti_file_id =
        projectDiagramFileCacti?.files?.find((f) => {
            return !!f?.selected;
        })?.file_id || "";

    await postGenerateDiagramFromCacti(
        {
            project_id,
            selected_cacti_file_id,
        },
        {}
    );
    const refreshedProjectDiagram = await refreshProjectDiagram();
    if (!refreshedProjectDiagram) throw new Error("projectDiagram is undefined.");

    await processImportDiagram({
        instanceId,
        projectDiagram: refreshedProjectDiagram,
        handleSetProcessedNodesAndEdges,
    });
};
