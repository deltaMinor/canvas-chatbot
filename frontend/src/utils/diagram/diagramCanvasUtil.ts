import { CanvasType, DiagramCanvas, ProjectDiagram } from "#root/interfaces/diagram";
import { HandleSetProcessedNodesAndEdges } from "#root/interfaces/diagramContent";
import { AttackPath } from "#root/interfaces/register";

export const reloadCanvas = ({
    projectDiagram,
    selectedCanvas, //
    selectedCanvasType,
    selectedPath: _selectedPath,
    viewAllPaths: _viewAllPaths,
    hideAllPaths: _hideAllPaths,
    handleSetProcessedNodesAndEdges,
    architectureCanvas,
}: {
    projectDiagram: ProjectDiagram;
    selectedCanvas?: DiagramCanvas;
    selectedCanvasType?: DiagramCanvas["canvas_type"] | undefined;
    selectedPath?: AttackPath;
    viewAllPaths?: boolean;
    hideAllPaths?: boolean;
    handleSetProcessedNodesAndEdges: HandleSetProcessedNodesAndEdges;
    architectureCanvas?: DiagramCanvas;
}) => {
    if (!selectedCanvas || !selectedCanvasType) return;
    const selectedCanvasNodes = selectedCanvas.nodes;
    const selectedCanvasEdges = selectedCanvas.edges;

    if (selectedCanvasType === CanvasType.architecture.toString()) {
        handleSetProcessedNodesAndEdges({
            canvasEdges: [...selectedCanvasEdges],
            canvasNodes: [...selectedCanvasNodes],
            funcRef: "DiagramElementActionContext",
            applyEdgeHandleRealignment: true,
        });
    }
};

// Retained as a passthrough for callers: with only the architecture canvas type
// remaining, there is no longer any derived/secondary canvas to recompute.
export const getSelectedCanvasFromId = ({
    projectDiagram,
    draftCanvasId,
}: {
    projectDiagram?: ProjectDiagram;
    draftCanvasId: string;
}) => {
    if (!projectDiagram?.canvas?.length) {
        return undefined;
    }

    const _selectedCanvas = projectDiagram.canvas?.find((c) => {
        return c?.canvas_id === draftCanvasId;
    });

    return _selectedCanvas;
};

export const getInitCanvasId = ({
    canvas,
    canvas_type,
}: {
    canvas: DiagramCanvas[]; //
    canvas_type?: string;
}) => {
    const initCanvas = canvas?.find((c) => {
        return c?.canvas_type === canvas_type;
    });
    if (!!initCanvas) {
        return initCanvas?.canvas_id;
    }

    const architectureCanvas = canvas?.find((c) => {
        return c?.canvas_type === CanvasType.architecture.toString();
    });
    if (!!architectureCanvas) {
        return architectureCanvas.canvas_id;
    }

    return "";
};

export const updateCanvasViewOnly = (diagram: ProjectDiagram) => {
    diagram.canvas = diagram.canvas.map((c) => {
        if (c.canvas_type === CanvasType.architecture) {
            return {
                ...c, //
                view_only: !!diagram?.isCompleted,
            };
        }
        return {
            ...c, //
            view_only: true,
        };
    });
};
