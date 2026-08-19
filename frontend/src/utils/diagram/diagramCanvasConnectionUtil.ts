import { Connection, Edge } from "@xyflow/react";
import { enqueueSnackbar } from "notistack";

import { CanvasEdgeColor, default_marker_props } from "#root/constants/diagram";
import {
    CanvasEdgeType,
    DiagramCanvas,
    DiagramNode,
    UserStoryCardRefEnum,
} from "#root/interfaces/diagram";
import { UuidIdentifierKey } from "#root/interfaces/identifier";
import { getInitializedDiagramEdge } from "#root/utils/diagram/diagramEdgeUtil";
import { generateUUID } from "#root/utils/identifierUtil";

export const is_edge_overlap_found = (
    edges: Edge[],
    params: Connection | Edge,
    edgeType: string
) => {
    let overlapFound = false;
    edges.forEach((edge) => {
        if (overlapFound) return;
        if (
            edge.source === params.source &&
            edge.target === params.target &&
            edge.data?.["type"] === edgeType
        ) {
            overlapFound = true;
        }
    });
    return overlapFound;
};

export const isConnectedEdgesExist = (edges: Edge[], node: DiagramNode) =>
    edges.filter((edge) => edge.source === node.id || edge.target === node.id).length > 0;

interface VerifyConnectProps {
    edges: Edge[];
    nodes: DiagramNode[];
    oldEdge?: Edge;
    params: Connection | Edge;
    selectedEdgeType: CanvasEdgeType;
}

export const getResolvedConnectionNodeId = (
    nodeId: string | null | undefined,
    nodes: DiagramNode[]
) => {
    if (!nodeId) {
        return nodeId;
    }

    const activeNode = nodes.find((node) => {
        const comparableNodeId = String(node.data?.["originalNodeId"] || node.id || "");
        return node.id === nodeId || comparableNodeId === nodeId;
    });

    return String(activeNode?.data?.["originalNodeId"] || activeNode?.id || nodeId);
};

export const resolveConnectionParams = (
    params: Connection | Edge,
    nodes: DiagramNode[]
): Connection | Edge => {
    const source = getResolvedConnectionNodeId(params.source, nodes);
    const target = getResolvedConnectionNodeId(params.target, nodes);

    return {
        ...params,
        ...(source ? { source } : {}),
        ...(target ? { target } : {}),
    };
};

export const verifyConnect = ({
    edges,
    nodes,
    oldEdge,
    params,
    selectedEdgeType,
}: VerifyConnectProps) => {
    const overlapFound = is_edge_overlap_found(edges || [], params, selectedEdgeType);
    if (!oldEdge) {
        if (overlapFound) {
            enqueueSnackbar("Edge already exists.", { variant: "error" });
            return false;
        }
    } else if (
        overlapFound &&
        !(params.source === oldEdge.source && params.target === oldEdge.target)
    ) {
        enqueueSnackbar("Edge already exists.", { variant: "error" });
        return false;
    }

    if (params.source === params.target) {
        enqueueSnackbar("Edge cannot connect to itself.", { variant: "error" });
        return false;
    }

    const sourceNode = nodes.find((node) => node.id === params.source);
    const targetNode = nodes.find((node) => node.id === params.target);

    if (
        (sourceNode?.data.cardRefKey === UserStoryCardRefEnum.card_users &&
            targetNode?.data.cardRefKey !== UserStoryCardRefEnum.card_interface) ||
        (sourceNode?.data.cardRefKey !== UserStoryCardRefEnum.card_interface &&
            targetNode?.data.cardRefKey === UserStoryCardRefEnum.card_users)
    ) {
        enqueueSnackbar("User Story User node can only be connected to Interface node.", {
            variant: "error",
        });
        return false;
    }

    return true;
};

interface GetNewEdgeOnConnectProps {
    params: Connection | Edge;
    selectedEdgeType: CanvasEdgeType;
    selectedCanvasRef: DiagramCanvas["ref"] | undefined;
    biDirectionalArrow: boolean;
}

export const getNewEdgeOnConnect = ({
    params,
    selectedEdgeType,
    selectedCanvasRef,
    biDirectionalArrow,
}: GetNewEdgeOnConnectProps) => {
    const { source, target, sourceHandle, targetHandle } = params;
    if (!source || !target || !sourceHandle || !targetHandle) return undefined;

    return getInitializedDiagramEdge({
        id: generateUUID(UuidIdentifierKey.diagramEdge),
        source,
        sourceHandle,
        target,
        targetHandle,
        type: "floating",
        data: {
            type: selectedEdgeType,
            ...(selectedCanvasRef?.card_ref?.card_id !== undefined && {
                card_id: selectedCanvasRef.card_ref.card_id,
            }),
            bidirectional: biDirectionalArrow,
        },
        ...(biDirectionalArrow && {
            markerStart: {
                ...default_marker_props,
                color: CanvasEdgeColor[selectedEdgeType as keyof typeof CanvasEdgeColor],
            },
        }),
    });
};
