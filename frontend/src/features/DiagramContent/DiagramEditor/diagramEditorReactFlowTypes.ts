import { EdgeTypes, NodeTypes } from "@xyflow/react";

import { FloatingEdge } from "#root/components/DiagramEdges";
import { ClusterNode, InfoNode } from "#root/components/DiagramNodes";

export const diagramEditorNodeTypes: NodeTypes = {
    infoNode: InfoNode,
    clusterNode: ClusterNode,
};

export const diagramEditorEdgeTypes: EdgeTypes = {
    floating: FloatingEdge,
};
