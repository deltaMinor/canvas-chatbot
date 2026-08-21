import React from "react";

import { Background, BackgroundVariant, ReactFlow } from "@xyflow/react";

import DiagramBodyShell from "#root/components/DiagramBodyShell";
import {
    diagram_grid_size_major,
    diagram_grid_size_minor,
    diagram_max_zoom,
    diagram_min_zoom,
} from "#root/constants/diagramConfig";
import { useCanvasEdges, useCanvasNodes, useDiagramBodyHandlers } from "#root/hooks/diagram";

import DiagramEditorBodyEffects from "./DiagramEditorBodyEffects";
import DiagramEditorPanels from "./DiagramEditorPanels";
import { diagramEditorEdgeTypes, diagramEditorNodeTypes } from "./diagramEditorReactFlowTypes";

const DiagramEditorCanvasBodyComponent = () => {
    const canvasNodes = useCanvasNodes();
    const canvasEdges = useCanvasEdges();
    const { containerRef, onInit } = useDiagramBodyHandlers();

    return (
        <DiagramBodyShell
            id="DiagramEditorBodyComponent"
            containerRef={containerRef}
        >
            <DiagramEditorBodyEffects />
            <ReactFlow
                // Manual, mouse-driven editing of the diagram is disabled. The
                // diagram can still be created/modified via the chatbot, which
                // updates the underlying store directly, bypassing these props.
                connectOnClick={false}
                deleteKeyCode={null}
                edges={canvasEdges}
                edgesFocusable={false}
                edgesReconnectable={false}
                edgeTypes={diagramEditorEdgeTypes}
                elementsSelectable={false}
                elevateEdgesOnSelect={false}
                elevateNodesOnSelect={false}
                fitView
                fitViewOptions={{ maxZoom: 1 }}
                maxZoom={diagram_max_zoom}
                minZoom={diagram_min_zoom}
                multiSelectionKeyCode={null}
                nodeClickDistance={4}
                nodeOrigin={[0, 0]}
                nodes={canvasNodes}
                nodesConnectable={false}
                nodesDraggable={false}
                nodesFocusable={false}
                nodeTypes={diagramEditorNodeTypes}
                onlyRenderVisibleElements
                onInit={onInit}
                selectionKeyCode={null}
                selectionOnDrag={false}
                selectNodesOnDrag={false}
                snapGrid={[diagram_grid_size_minor, diagram_grid_size_minor]}
                snapToGrid
                style={{ backgroundColor: "white" }}
                zoomOnDoubleClick={false}
            >
                <Background
                    id="1"
                    gap={diagram_grid_size_minor}
                    color="rgba(220,220,220,0.3)"
                    variant={BackgroundVariant.Lines}
                />
                <Background
                    id="2"
                    gap={diagram_grid_size_major}
                    color="rgba(220,220,220,0.5)"
                    variant={BackgroundVariant.Lines}
                />
                <DiagramEditorPanels />
            </ReactFlow>
        </DiagramBodyShell>
    );
};

export default React.memo(DiagramEditorCanvasBodyComponent);
