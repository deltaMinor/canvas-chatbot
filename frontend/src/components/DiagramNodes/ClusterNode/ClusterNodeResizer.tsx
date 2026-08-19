import React from "react";

import {
    NodeProps,
    NodeResizer,
    OnResizeEnd,
    ResizeDragEvent,
    ResizeParams,
    useReactFlow,
} from "@xyflow/react";
import { enqueueSnackbar } from "notistack";

import { CanvasEdgeColor } from "#root/constants/diagram";
import { useDiagramInstanceId } from "#root/contexts/DiagramInstanceContext";
import {
    useAppendCanvasHistory,
    useDiagramDraftCanvasId,
    useDiagramDraftCanvasNodes,
    useHandleSetProcessedNodes,
} from "#root/hooks/diagram";
import { DiagramComponentType, DiagramEdge, DiagramNode } from "#root/interfaces/diagram";
import { updateCanvas, updateSingleNode } from "#root/stores/projectDiagramFeaturePersistenceStore";
import { colors } from "#root/theme/PureLightTheme";
import { checkIfNodeOverlap, checkResizeEndConditions } from "#root/utils/diagram/diagramNodeUtil";

interface ClusterNodeResizerProps extends NodeProps {
    min_width: number;
    min_height: number;
}

const ClusterNodeResizerComponent: React.FC<ClusterNodeResizerProps> = (props) => {
    const { min_width, min_height } = props;

    const instanceId = useDiagramInstanceId();
    const appendCanvasHistory = useAppendCanvasHistory();
    const selectedCanvasNodes = useDiagramDraftCanvasNodes();
    const selectedCanvasId = useDiagramDraftCanvasId();
    const handleSetProcessedNodes = useHandleSetProcessedNodes();
    const reactFlow = useReactFlow<DiagramNode, DiagramEdge>();

    const onResizeEnd: OnResizeEnd = React.useCallback(
        async (_event: ResizeDragEvent, params: ResizeParams) => {
            const canvasNodes = structuredClone(selectedCanvasNodes);
            try {
                const nodeIndex = canvasNodes?.findIndex((n) => n?.id === props?.id);
                if (nodeIndex < 0) throw new Error("Cluster node cannot be found.");

                const originalNode = canvasNodes[nodeIndex];
                if (!originalNode) throw new Error("Original node cannot be found.");

                const changedNode = {
                    ...originalNode,
                    id: props.id,
                    position: { x: params.x, y: params.y },
                    data: originalNode.data,
                    style: {
                        ...originalNode?.style,
                        height: params.height,
                        width: params.width,
                    },
                    measured: {
                        height: params.height,
                        width: params.width,
                    },
                    height: params.height,
                    width: params.width,
                };
                canvasNodes[nodeIndex] = changedNode;

                checkResizeEndConditions({
                    allNodes: canvasNodes,
                    node_id: props.id,
                    params,
                });

                checkIfNodeOverlap({
                    allNodes: canvasNodes,
                    changedNode,
                });

                handleSetProcessedNodes({
                    canvasNodes,
                    funcRef: "onResizeEnd",
                });
                const nextSelectedCanvas = await updateSingleNode({
                    node: changedNode,
                    canvas_id: selectedCanvasId ?? "",
                    instanceId,
                });
                if (nextSelectedCanvas) {
                    appendCanvasHistory(nextSelectedCanvas);
                }
            } catch (err) {
                enqueueSnackbar(`${err}`, { variant: "error" });
                handleSetProcessedNodes({
                    canvasNodes: selectedCanvasNodes,
                    funcRef: "onResizeEnd",
                });
                const nextSelectedCanvas = await updateCanvas({
                    instanceId,
                    canvasNodes: selectedCanvasNodes, //
                    ...(selectedCanvasId && {
                        selectedCanvasId,
                    }),
                    viewport: reactFlow.getViewport(),
                });
                if (nextSelectedCanvas) {
                    appendCanvasHistory(nextSelectedCanvas);
                }
            }
        },
        [
            selectedCanvasNodes,
            selectedCanvasId,
            props.id,
            reactFlow,
            handleSetProcessedNodes,
            appendCanvasHistory,
            instanceId,
        ]
    );

    const getResizerColor = () => {
        if (props?.data?.["type"] === DiagramComponentType.architecture) {
            return CanvasEdgeColor.architecture;
        } else if (props?.data?.["type"] === DiagramComponentType.data_flow) {
            return CanvasEdgeColor.data_flow;
        }
        return colors.primary.main;
    };

    return (
        <NodeResizer
            color={getResizerColor()}
            handleStyle={{
                margin: "1px",
                width: "8px",
                height: "8px",
                borderRadius: "3px",
                background: "#ffffff",
                border: `2px solid ${getResizerColor()}`,
                boxShadow: "0 4px 12px rgba(15, 23, 42, 0.16)",
            }}
            isVisible={false}
            lineStyle={{
                borderColor: "rgba(124, 58, 237, 0.28)",
                borderWidth: "1px",
            }}
            minHeight={min_height}
            minWidth={min_width}
            onResizeEnd={onResizeEnd}
        />
    );
};

export default ClusterNodeResizerComponent;
