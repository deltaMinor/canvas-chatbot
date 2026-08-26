import { DiagramCanvas, ProjectDiagram } from "#root/interfaces/diagram";
import { HandleSetProcessedNodesAndEdges } from "#root/interfaces/diagramContent";
import app_store, { app_actions } from "#root/redux/store";
import { postGenerateDiagramFromCacti } from "#root/services/domain/diagram";
import { refreshProjectDiagram } from "#root/stores/backendRefreshStore";
import { getProjectCactiFromStore, getProjectIdFromStore } from "#root/stores/backendStore";
import {
    getDiagramDraftCanvasFromStore,
    setDiagramDraftCanvas,
    setDiagramDraftCanvasId,
} from "#root/stores/projectDiagram/canvas";
import { updateProjectDiagram } from "#root/stores/projectDiagramFeaturePersistenceStore";
import {
    appendCanvasHistory,
    getCanvasHistory,
} from "#root/utils/diagram/diagramCanvasHistoryUtil";
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
    // Snapshot whatever is on the canvas right before the import is applied.
    // File/address-based imports (the chatbot "/import" command and the
    // "Import Diagram" chat button) assign the imported canvas a brand-new
    // canvas_id - see `parseImportedDiagramCanvas` - so without this, the new
    // id's undo/redo history would start out completely empty and undo would
    // have nothing to revert to, even though a snapshot was appended below.
    const priorCanvas = getDiagramDraftCanvasFromStore(instanceId);

    const setSelectedCanvas = (value: React.SetStateAction<DiagramCanvas | undefined>) =>
        setDiagramDraftCanvas(value, instanceId);

    app_store.dispatch(app_actions.backend.setProjectDiagram(projectDiagram));

    const draftCanvasId = getInitCanvasId({
        canvas: projectDiagram.canvas,
    });
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
    const project_id = getProjectIdFromStore();
    if (!project_id) {
        return;
    }

    const { canvas_data_history: existingHistoryForImportedCanvas } = getCanvasHistory(
        project_id,
        selectedCanvas.canvas_id
    );
    if (
        existingHistoryForImportedCanvas.length === 0 &&
        priorCanvas &&
        priorCanvas.canvas_id !== selectedCanvas.canvas_id
    ) {
        appendCanvasHistory({
            instanceId,
            project_id,
            selectedCanvas: { ...priorCanvas, canvas_id: selectedCanvas.canvas_id },
        });
    }

    appendCanvasHistory({
        instanceId,
        project_id,
        selectedCanvas,
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
