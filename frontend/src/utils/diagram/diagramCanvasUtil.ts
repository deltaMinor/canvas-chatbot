import { CanvasType, DiagramCanvas, ProjectDiagram } from "#root/interfaces/diagram";
import { HandleSetProcessedNodesAndEdges } from "#root/interfaces/diagramContent";
import { AttackPath } from "#root/interfaces/register";
import { DFNodePlacementManager } from "#root/lib/DFNodePlacementManager";

import { getDFRefPosition } from "./diagramNodePositionUtil";
import { getSummaryCanvas } from "./diagramSummaryUtil";

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
    } else if (
        selectedCanvasType === CanvasType.data_flow.toString() //
    ) {
        const selectedCanvasId = selectedCanvas?.canvas_id ?? "";
        const _selectedCanvas = getUpdatedDFCanvas(
            projectDiagram, //
            architectureCanvas ?? ({} as DiagramCanvas),
            selectedCanvasId
        );
        const selectedCanvasNodes = _selectedCanvas?.nodes ?? [];
        const selectedCanvasEdges = _selectedCanvas?.edges ?? [];
        handleSetProcessedNodesAndEdges({
            canvasEdges: selectedCanvasEdges,
            canvasNodes: selectedCanvasNodes,
            funcRef: "DiagramElementActionContext",
            applyEdgeHandleRealignment: true,
        });
    } else if (
        selectedCanvasType === CanvasType.summary.toString() //
    ) {
        const {
            summary_canvas, //
        } = getSummaryCanvas({ projectDiagram });

        handleSetProcessedNodesAndEdges({
            canvasEdges: [...summary_canvas.edges],
            canvasNodes: [...summary_canvas.nodes],
            funcRef: "DiagramElementActionContext",
            applyEdgeHandleRealignment: true,
        });
    }
};

export const getUpdatedDFCanvas = (
    projectDiagram: ProjectDiagram,
    architectureCanvas: DiagramCanvas,
    draftCanvasId: string
) => {
    const { __projectDiagram } = updateDFCanvas(
        projectDiagram,
        architectureCanvas ?? ({} as DiagramCanvas),
        true
    );
    const _selectedCanvas = __projectDiagram?.canvas?.find((c) => c?.canvas_id === draftCanvasId);
    return _selectedCanvas;
};

export const updateDFCanvas = (
    projectDiagram: ProjectDiagram,
    architectureCanvas: DiagramCanvas,
    refresh?: boolean
): {
    __projectDiagram: ProjectDiagram;
    updateDF: boolean;
} => {
    const __projectDiagram = structuredClone(projectDiagram);

    let updateDF = false;
    if (!Object.keys(architectureCanvas).length || !architectureCanvas?.nodes?.length)
        return {
            __projectDiagram,
            updateDF,
        };
    const refPosition = getDFRefPosition(architectureCanvas);

    __projectDiagram.canvas.forEach((c) => {
        if (c.canvas_type === CanvasType.data_flow) {
            updateDF = refresh
                ? refresh
                : c.nodes.some((n) => n.hidden || !("canvasColumn" in n.data));
            if (updateDF) {
                const manager = new DFNodePlacementManager(
                    c.nodes,
                    refPosition //
                );
                const _nodes = manager.setDFNodes();
                _nodes.forEach((n) => {
                    n.hidden = false;
                });
                c.nodes = _nodes;
            }
        }
    });
    return {
        __projectDiagram, //
        updateDF,
    };
};

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
    if (_selectedCanvas) {
        return _selectedCanvas;
    }

    if (draftCanvasId === CanvasType.summary.toString()) {
        const { summary_canvas } = getSummaryCanvas({
            projectDiagram,
        });
        return {
            ...summary_canvas, //
        };
    }

    return undefined;
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
        if (
            !![
                CanvasType.architecture, //
                CanvasType.data_flow,
            ]?.includes(c.canvas_type)
        ) {
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
