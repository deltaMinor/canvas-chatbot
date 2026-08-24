import { Node } from "@xyflow/react";

import {
    CanvasNodeVariantType,
    DiagramNode,
    NodeToDataMappingSingle,
} from "#root/interfaces/diagram";

const getNonDataFlowInfoNodes = (nodes: DiagramNode[]) => {
    return (
        nodes?.filter((node: Node) => {
            return node?.type === CanvasNodeVariantType.infoNode;
        }) || []
    );
};

export const getNodeToDataMapping = (nodes: DiagramNode[]) => {
    const _nodes = getNonDataFlowInfoNodes(nodes);
    const _nodeToDataMapping: NodeToDataMappingSingle[] =
        _nodes?.map((node: Node) => {
            return {
                id: node.id || "",
                data_stored: (node?.data?.["data_stored"] as string[]) || [],
            };
        }) || [];
    return _nodeToDataMapping;
};

export const getNodeOptions = (nodes: DiagramNode[]) => {
    const _nodes = getNonDataFlowInfoNodes(nodes);
    return (
        _nodes
            ?.map((node) => ({
                label: node?.data?.label as string,
                value: node?.id,
            }))
            ?.sort((a, b) => a.label.localeCompare(b.label)) || []
    );
};
