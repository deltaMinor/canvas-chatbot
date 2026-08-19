import React from "react";

import { Background, BackgroundVariant, EdgeTypes, ReactFlow, ReactFlowProps } from "@xyflow/react";

import { FloatingEdge } from "#root/components/DiagramEdges";
import { ClusterNode, InfoNode } from "#root/components/DiagramNodes";
import {
    diagram_grid_size_major,
    diagram_grid_size_minor,
    diagram_max_zoom,
    diagram_min_zoom,
} from "#root/constants/diagramConfig";
import { DiagramEdge, DiagramNode } from "#root/interfaces/diagram";

const readOnlyNodeTypes = {
    infoNode: InfoNode,
    clusterNode: ClusterNode,
};

const readOnlyEdgeTypes: EdgeTypes = {
    floating: FloatingEdge,
};

type DisabledEditingProps =
    | "connectOnClick"
    | "deleteKeyCode"
    | "edgesFocusable"
    | "edgesReconnectable"
    | "edgeTypes"
    | "elementsSelectable"
    | "multiSelectionKeyCode"
    | "nodesConnectable"
    | "nodesDraggable"
    | "nodesFocusable"
    | "nodeTypes"
    | "onBeforeDelete"
    | "onConnect"
    | "onConnectEnd"
    | "onConnectStart"
    | "onClickConnectEnd"
    | "onClickConnectStart"
    | "onDelete"
    | "onEdgesChange"
    | "onEdgesDelete"
    | "onNodeDrag"
    | "onNodeDragStart"
    | "onNodeDragStop"
    | "onNodesChange"
    | "onNodesDelete"
    | "onReconnect"
    | "onReconnectEnd"
    | "onReconnectStart"
    | "onSelectionChange"
    | "onSelectionDrag"
    | "onSelectionDragStart"
    | "onSelectionDragStop"
    | "onSelectionEnd"
    | "onSelectionStart"
    | "selectionKeyCode"
    | "selectionOnDrag"
    | "selectNodesOnDrag";

export interface ReadOnlyDiagramFlowProps extends Omit<
    ReactFlowProps<DiagramNode, DiagramEdge>,
    DisabledEditingProps
> {
    hideBackground?: boolean;
}

const ReadOnlyDiagramFlowComponent = ({
    children,
    edges,
    hideBackground = false,
    maxZoom = diagram_max_zoom,
    minZoom = diagram_min_zoom,
    nodes,
    nodeOrigin = [0, 0],
    onlyRenderVisibleElements = true,
    snapGrid = [diagram_grid_size_minor, diagram_grid_size_minor],
    snapToGrid = true,
    style,
    zoomOnDoubleClick = false,
    ...reactFlowProps
}: ReadOnlyDiagramFlowProps) => {
    const readOnlyNodes = React.useMemo(
        () =>
            nodes?.map((node) => ({
                ...node,
                connectable: false,
                data: {
                    ...node.data,
                    disableHandles: true,
                },
                draggable: false,
                focusable: false,
                selectable: false,
                selected: false,
            })),
        [nodes]
    );
    const readOnlyEdges = React.useMemo(
        () =>
            edges?.map((edge) => ({
                ...edge,
                focusable: false,
                reconnectable: false,
                selectable: false,
                selected: false,
            })),
        [edges]
    );

    return (
        <ReactFlow<DiagramNode, DiagramEdge>
            {...reactFlowProps}
            connectOnClick={false}
            deleteKeyCode={null}
            edgeTypes={readOnlyEdgeTypes}
            edgesFocusable={false}
            edgesReconnectable={false}
            elementsSelectable={false}
            maxZoom={maxZoom}
            minZoom={minZoom}
            multiSelectionKeyCode={null}
            {...(readOnlyNodes && { nodes: readOnlyNodes })}
            nodesConnectable={false}
            nodesDraggable={false}
            nodesFocusable={false}
            nodeOrigin={nodeOrigin}
            nodeTypes={readOnlyNodeTypes}
            onlyRenderVisibleElements={onlyRenderVisibleElements}
            {...(readOnlyEdges && { edges: readOnlyEdges })}
            selectionKeyCode={null}
            selectionOnDrag={false}
            selectNodesOnDrag={false}
            snapGrid={snapGrid}
            snapToGrid={snapToGrid}
            style={{ backgroundColor: "white", ...style }}
            zoomOnDoubleClick={zoomOnDoubleClick}
        >
            {!hideBackground && (
                <>
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
                </>
            )}
            {children}
        </ReactFlow>
    );
};

export default React.memo(ReadOnlyDiagramFlowComponent);
