import React from "react";

import { ReactFlowInstance } from "@xyflow/react";

import { useDiagramInstanceId } from "#root/contexts/DiagramInstanceContext";
import { DiagramEdge, DiagramNode } from "#root/interfaces/diagram";
import { setDiagramCanvasInit } from "#root/stores/projectDiagram/canvas";

import { useDiagramCanvasHandlerRollback } from "./useDiagramCanvasHandlerRollback";

/**
 * Handlers for the diagram canvas.
 *
 * Manual, mouse-driven editing of the diagram (dragging, connecting,
 * reconnecting, dropping new nodes, clicking a node/edge to select or open
 * an attribute editor, etc.) has intentionally been removed. The canvas is
 * display-only from the user's perspective; the diagram can still be
 * created and modified entirely through the chatbot, which writes directly
 * to the diagram store.
 */
export const useDiagramBodyHandlers = () => {
    const instanceId = useDiagramInstanceId();

    const canvasNodesRef = React.useRef<DiagramNode[]>([]);
    const canvasEdgesRef = React.useRef<DiagramEdge[]>([]);
    const reactFlowInstanceRef = React.useRef<ReactFlowInstance<DiagramNode, DiagramEdge> | null>(
        null
    );
    const containerRef = React.useRef<HTMLDivElement>(null);
    const { runCanvasHandlerWithRollback } = useDiagramCanvasHandlerRollback({
        instanceId,
        canvasNodesRef,
        canvasEdgesRef,
        reactFlowInstanceRef,
    });

    const onInit = React.useCallback(
        (reactFlowInstance: ReactFlowInstance<DiagramNode, DiagramEdge>) => {
            void runCanvasHandlerWithRollback("onInit", () => {
                reactFlowInstanceRef.current = reactFlowInstance;
                setDiagramCanvasInit(true, instanceId);
            });
        },
        [instanceId, reactFlowInstanceRef, runCanvasHandlerWithRollback]
    );

    return {
        containerRef,
        onInit,
    };
};
