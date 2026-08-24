import { CanvasColumn, CanvasType } from "#root/enums/diagram";
import { DiagramCanvas, DiagramNode } from "#root/interfaces/diagram";
import { DFNodePlacementManager } from "#root/lib/DFNodePlacementManager";
import { getDFRefPosition } from "#root/utils/diagram/diagramNodePositionUtil";

export const updateArchitectureNodesDataStored = (
    architectureNodes: DiagramNode[],
    selectedNodeIds: string[],
    dataItemValue: string
): DiagramNode[] => {
    return architectureNodes.map((node) => {
        const data_stored = (node.data?.["data_stored"] as string[]) || [];
        if (selectedNodeIds.includes(node.id)) {
            const nextDataStored = [...new Set([...data_stored, dataItemValue])].sort();
            return {
                ...node,
                data: {
                    ...node.data,
                    data_stored: nextDataStored,
                },
            };
        }

        const nextDataStored = [...new Set(data_stored.filter((d) => d !== dataItemValue))].sort();
        return {
            ...node,
            data: {
                ...node.data,
                data_stored: nextDataStored,
            },
        };
    });
};

export const updateNodesCanvasColumn = (
    nodes: DiagramNode[],
    nodeIds: string[],
    canvasColumn: CanvasColumn
): DiagramNode[] => {
    return nodes.map((node) => {
        if (!nodeIds.includes(node.id)) {
            return node;
        }

        return {
            ...node,
            data: {
                ...node.data,
                canvasColumn,
            },
        };
    });
};

export const updateDataFlowCanvases = (
    canvasList: DiagramCanvas[],
    architectureCanvas: DiagramCanvas
): DiagramCanvas[] => {
    const refPosition = getDFRefPosition(architectureCanvas);

    return canvasList.map((canvas) => {
        if (canvas.canvas_type !== CanvasType.data_flow) {
            return canvas;
        }

        const manager = new DFNodePlacementManager(canvas.nodes, refPosition);
        return {
            ...canvas,
            nodes: manager.setDFNodes(),
        };
    });
};

export const positionDataFlowCanvasNodes = (
    nodes: DiagramNode[],
    architectureCanvas: DiagramCanvas
): DiagramNode[] => {
    const refPosition = getDFRefPosition(architectureCanvas);
    const manager = new DFNodePlacementManager(nodes, refPosition);
    return manager.setDFNodes();
};
