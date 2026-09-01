import { HandleSetProcessedNodesAndEdges } from "#root/interfaces/diagramContent";
import { fetchProjectDiagramFileGeneratedJsonContent } from "#root/services/domain/diagram_generated_json_file";
import { updateProjectDiagram } from "#root/stores/projectDiagramFeaturePersistenceStore";
import { getBackendProjectDiagramFromStore } from "#root/stores/projectDiagramFeatureStore";
import { processImportDiagram } from "#root/utils/diagram/diagramImportDialogUtil";
import { parseImportedDiagramCanvas } from "#root/utils/diagramChatbot/importDiagram";

export const importDiagramFromFile = async ({
    instanceId,
    handleSetProcessedNodesAndEdges,
    file,
}: {
    instanceId: string;
    handleSetProcessedNodesAndEdges: HandleSetProcessedNodesAndEdges;
    file: File;
}): Promise<string> => {
    const fileText = await file.text();
    const importedCanvas = parseImportedDiagramCanvas(fileText);

    await updateProjectDiagram({ canvas: importedCanvas });
    const mergedProjectDiagram = getBackendProjectDiagramFromStore();

    await processImportDiagram({
        instanceId,
        projectDiagram: mergedProjectDiagram,
        handleSetProcessedNodesAndEdges,
    });

    const totalNodes = importedCanvas.reduce((sum, canvas) => sum + (canvas.nodes?.length ?? 0), 0);
    const totalEdges = importedCanvas.reduce((sum, canvas) => sum + (canvas.edges?.length ?? 0), 0);

    return `Diagram imported successfully. Loaded ${totalNodes} node(s) and ${totalEdges} edge(s) across ${importedCanvas.length} canvas(es).`;
};

export const importDiagramFromTopologyGeneratorAddress = async ({
    instanceId,
    handleSetProcessedNodesAndEdges,
    projectId,
    fileId,
}: {
    instanceId: string;
    handleSetProcessedNodesAndEdges: HandleSetProcessedNodesAndEdges;
    projectId: string;
    fileId: string;
}): Promise<string> => {
    const content = await fetchProjectDiagramFileGeneratedJsonContent({
        project_id: projectId,
        file_id: fileId,
    });
    if (!content) {
        throw new Error("The generated topology file could not be found.");
    }

    const file = new File([content], "diagram.json", {
        type: "application/json",
    });

    return importDiagramFromFile({ instanceId, handleSetProcessedNodesAndEdges, file });
};
