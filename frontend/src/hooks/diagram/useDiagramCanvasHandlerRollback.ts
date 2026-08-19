import React from "react";

import { ReactFlowInstance } from "@xyflow/react";
import { enqueueSnackbar } from "notistack";

import { DiagramEdge, DiagramNode } from "#root/interfaces/diagram";
import {
    getDiagramCanvasInitFromStore,
    getDiagramNodeHandleEdgeMappingFromStore,
    setDiagramCanvasInit,
    setDiagramDraftCanvasEdges,
    setDiagramDraftCanvasNodes,
    setDiagramNodeHandleEdgeMapping,
} from "#root/stores/projectDiagram/canvas";
import {
    getDiagramCanvasHistoryFromStore,
    getDiagramCanvasHistoryIndexFromStore,
    setDiagramCanvasHistory,
    setDiagramCanvasHistoryIndex,
} from "#root/stores/projectDiagram/canvasHistory";
import {
    getDiagramIsConnectingFromStore,
    getDiagramIsConnectingHandleTypeFromStore,
    setDiagramIsConnecting,
    setDiagramIsConnectingHandleType,
} from "#root/stores/projectDiagram/connection";
import {
    getDiagramLineSegmentsFromStore,
    setDiagramLineSegments,
} from "#root/stores/projectDiagram/draggableEdge";
import {
    getDiagramDrawerStateFromStore,
    setDiagramDrawerState,
} from "#root/stores/projectDiagram/drawer";
import {
    getDiagramSelectedEdgeIdListFromStore,
    getDiagramSelectedNodeIdListFromStore,
    setDiagramSelectedEdgeIdList,
    setDiagramSelectedNodeIdList,
} from "#root/stores/projectDiagram/selection";

export const useDiagramCanvasHandlerRollback = ({
    instanceId,
    canvasNodesRef,
    canvasEdgesRef,
    reactFlowInstanceRef,
}: {
    instanceId: string;
    canvasNodesRef: React.MutableRefObject<DiagramNode[]>;
    canvasEdgesRef: React.MutableRefObject<DiagramEdge[]>;
    reactFlowInstanceRef: React.MutableRefObject<ReactFlowInstance<
        DiagramNode,
        DiagramEdge
    > | null>;
}) => {
    const captureCanvasHandlerSnapshot = React.useCallback(() => {
        return {
            canvasHistory: structuredClone(getDiagramCanvasHistoryFromStore(instanceId)),
            canvasHistoryIndex: getDiagramCanvasHistoryIndexFromStore(instanceId),
            canvasInit: getDiagramCanvasInitFromStore(instanceId),
            drawerState: structuredClone(getDiagramDrawerStateFromStore(instanceId)),
            edges: structuredClone(canvasEdgesRef.current),
            isConnecting: getDiagramIsConnectingFromStore(instanceId),
            isConnectingHandleType: getDiagramIsConnectingHandleTypeFromStore(instanceId),
            lineSegments: structuredClone(getDiagramLineSegmentsFromStore(instanceId)),
            nodeHandleEdgeMapping: structuredClone(
                getDiagramNodeHandleEdgeMappingFromStore(instanceId)
            ),
            nodes: structuredClone(canvasNodesRef.current),
            selectedEdgeIdList: structuredClone(getDiagramSelectedEdgeIdListFromStore(instanceId)),
            selectedNodeIdList: structuredClone(getDiagramSelectedNodeIdListFromStore(instanceId)),
            canvasEdgesRef: structuredClone(canvasEdgesRef.current),
            canvasNodesRef: structuredClone(canvasNodesRef.current),
            reactFlowInstance: reactFlowInstanceRef.current ?? null,
        };
    }, [canvasEdgesRef, canvasNodesRef, instanceId, reactFlowInstanceRef]);

    const restoreCanvasHandlerSnapshot = React.useCallback(
        (
            snapshot: ReturnType<typeof captureCanvasHandlerSnapshot> //
        ) => {
            setDiagramCanvasHistory(snapshot.canvasHistory, instanceId);
            setDiagramCanvasHistoryIndex(snapshot.canvasHistoryIndex, instanceId);
            setDiagramCanvasInit(snapshot.canvasInit, instanceId);
            setDiagramDrawerState(snapshot.drawerState, instanceId);
            setDiagramDraftCanvasEdges(snapshot.edges, instanceId);
            setDiagramIsConnecting(snapshot.isConnecting, instanceId);
            setDiagramIsConnectingHandleType(snapshot.isConnectingHandleType, instanceId);
            setDiagramLineSegments(snapshot.lineSegments, instanceId);
            setDiagramNodeHandleEdgeMapping(snapshot.nodeHandleEdgeMapping, instanceId);
            setDiagramDraftCanvasNodes(snapshot.nodes, instanceId);
            setDiagramSelectedEdgeIdList(snapshot.selectedEdgeIdList, instanceId);
            setDiagramSelectedNodeIdList(snapshot.selectedNodeIdList, instanceId);
            canvasEdgesRef.current = snapshot.canvasEdgesRef;
            canvasNodesRef.current = snapshot.canvasNodesRef;
            reactFlowInstanceRef.current = snapshot.reactFlowInstance;
        },
        [canvasEdgesRef, canvasNodesRef, instanceId, reactFlowInstanceRef]
    );

    const notifyCanvasHandlerError = React.useCallback((handlerName: string, error: unknown) => {
        const message = error instanceof Error ? error.message : String(error);

        enqueueSnackbar(`An error occurred in ${handlerName}. Changes were reverted. ${message}`, {
            variant: "error",
        });
    }, []);

    const runCanvasHandlerWithRollback = React.useCallback(
        async <T>(handlerName: string, action: () => Promise<T> | T) => {
            const snapshot = captureCanvasHandlerSnapshot();

            try {
                return await action();
            } catch (error) {
                restoreCanvasHandlerSnapshot(snapshot);
                notifyCanvasHandlerError(handlerName, error);
                return undefined;
            }
        },
        [captureCanvasHandlerSnapshot, notifyCanvasHandlerError, restoreCanvasHandlerSnapshot]
    );

    return {
        captureCanvasHandlerSnapshot,
        restoreCanvasHandlerSnapshot,
        notifyCanvasHandlerError,
        runCanvasHandlerWithRollback,
    };
};
