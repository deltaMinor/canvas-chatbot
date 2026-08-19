import {
    BaseEdge,
    Edge,
    EdgeProps,
    ReactFlowState,
    getSmoothStepPath,
    useReactFlow,
    useStore,
} from "@xyflow/react";

import { DiagramEdge, DiagramNode } from "#root/interfaces/diagram";
import { getEdgeParams } from "#root/utils/diagram/diagramEdgeParamsUtil";
import { getHandlePosition, getOverlappingEdgesInOrder } from "#root/utils/diagram/diagramEdgeUtil";

const EDGE_VERTICAL_OFFSET = 10;

const FloatingEdgeComponent = (
    edgeProps: EdgeProps<DiagramEdge> //
) => {
    const {
        source, //
        target,
        sourcePosition,
        targetPosition,
    } = edgeProps;

    const reactFlow = useReactFlow<DiagramNode, DiagramEdge>();
    const { getEdges, getNodes } = reactFlow;

    const edges = getEdges();
    const nodes = getNodes();

    const _edges =
        edges
            ?.filter((e) => {
                return (
                    (e?.targetHandle?.split("_")?.slice(-1)[0] === targetPosition &&
                        e?.target === target) ||
                    (e?.sourceHandle?.split("_")?.slice(-1)[0] === targetPosition &&
                        e?.source === target) ||
                    (e?.targetHandle?.split("_")?.slice(-1)[0] === sourcePosition &&
                        e?.target === source) ||
                    (e?.sourceHandle?.split("_")?.slice(-1)[0] === sourcePosition &&
                        e?.source === source)
                );
            })
            ?.map((e, index) => {
                return { ...e, edge_index: index };
            }) || [];

    const edge = _edges?.find(
        (e) =>
            e?.source === source &&
            e?.target === target &&
            e?.sourceHandle?.split("_")?.slice(-1)[0] === sourcePosition &&
            e?.targetHandle?.split("_")?.slice(-1)[0] === targetPosition
    );
    const vertical_offset = !!edge //
        ? 5 + EDGE_VERTICAL_OFFSET * (edge?.edge_index + 1)
        : 0;

    const sourceNode = useStore((store: ReactFlowState<DiagramNode, DiagramEdge>) => {
        return store.nodeLookup.get(source);
    });
    const targetNode = useStore((store: ReactFlowState<DiagramNode, DiagramEdge>) => {
        return store.nodeLookup.get(target);
    });
    if (!sourceNode || !targetNode) {
        return <></>;
    }

    const edge_params = getEdgeParams({
        source: sourceNode, //
        target: targetNode,
        edgeProps,
        allNodes: nodes,
    });

    const edgesInOrder = getOverlappingEdgesInOrder({
        edges,
        allNodes: nodes,
        refNodeId: edge?.target || "",
        refNodehandle: edge?.targetHandle || "",
    });
    const edgeIdsInOrder = edgesInOrder.map((e) => e.id);
    const {
        staggeredX: staggeredTargetX, //
        staggeredY: staggeredTargetY,
    } = getHandlePosition(
        edgeIdsInOrder, //
        edge as Edge,
        edge?.targetHandle || "",
        edge_params.targetX,
        edge_params.targetY
    );
    edge_params.targetX = staggeredTargetX;
    edge_params.targetY = staggeredTargetY;

    const [edgePath] = getSmoothStepPath({
        ...edge_params,
        offset: vertical_offset,
    });

    return (
        <BaseEdge
            {...edgeProps}
            path={edgePath} //
        />
    );
};

export default FloatingEdgeComponent;
