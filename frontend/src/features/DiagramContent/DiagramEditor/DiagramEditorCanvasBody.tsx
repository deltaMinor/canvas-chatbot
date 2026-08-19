import React from "react";

import { Background, BackgroundVariant, ReactFlow } from "@xyflow/react";

import DiagramBodyShell from "#root/components/DiagramBodyShell";
import { ConnectionLine } from "#root/components/DiagramEdges";
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
    const {
        containerRef,
        onDragOver,
        onConnectStart,
        onReconnectStart,
        onConnectEnd,
        onReconnectEnd,
        onEdgesChange,
        onNodesChange,
        onReconnect,
        onConnect,
        onInit,
        onDrop,
        onNodeClick,
        onEdgeClick,
        onNodeDragStart,
        onNodeDragStop,
        onPaneClick,
    } = useDiagramBodyHandlers();

    return (
        <DiagramBodyShell
            id="DiagramEditorBodyComponent"
            containerRef={containerRef}
        >
            <DiagramEditorBodyEffects />
            <ReactFlow
                deleteKeyCode={[]}
                connectionLineComponent={ConnectionLine}
                edges={canvasEdges}
                edgeTypes={diagramEditorEdgeTypes}
                elevateEdgesOnSelect={true}
                elevateNodesOnSelect={false}
                fitView
                fitViewOptions={{ maxZoom: 1 }}
                maxZoom={diagram_max_zoom}
                minZoom={diagram_min_zoom}
                nodeClickDistance={4}
                nodeOrigin={[0, 0]}
                nodes={canvasNodes}
                nodeTypes={diagramEditorNodeTypes}
                onlyRenderVisibleElements
                onConnect={onConnect}
                onConnectStart={onConnectStart}
                onConnectEnd={onConnectEnd}
                onDragOver={onDragOver}
                onDrop={onDrop}
                onEdgeClick={onEdgeClick}
                onEdgesChange={onEdgesChange}
                onInit={onInit}
                onNodeClick={onNodeClick}
                onNodeDragStart={onNodeDragStart}
                onNodeDragStop={onNodeDragStop}
                onNodesChange={onNodesChange}
                onPaneClick={onPaneClick}
                onReconnect={onReconnect}
                onReconnectStart={onReconnectStart}
                onReconnectEnd={onReconnectEnd}
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
