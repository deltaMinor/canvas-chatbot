import { Viewport } from "@xyflow/react";
import { enqueueSnackbar } from "notistack";

import {
    DiagramCanvas,
    DiagramNode,
    NodeAlignmentDirection,
    NodeSpacingDirection,
} from "#root/interfaces/diagram";
import { getDiagramDraftCanvasFromStore } from "#root/stores/projectDiagram/canvas";
import {
    getDiagramSelectedNodeIdListFromStore,
    getSelectedNodesFromStore,
} from "#root/stores/projectDiagram/selection";
import { updateCanvas } from "#root/stores/projectDiagramFeaturePersistenceStore";

export const getAlignedNodes = ({
    nodes, //
    direction,
}: {
    nodes: DiagramNode[];
    direction: NodeAlignmentDirection;
}) => {
    let _nodes = [] as DiagramNode[];
    switch (direction) {
        case "left": {
            const minPosX = Math.min(...(nodes || []).map((n) => n?.position.x));
            _nodes = (nodes || []).map((n) => {
                return {
                    ...n,
                    position: { x: minPosX, y: n?.position.y },
                };
            });
            break;
        }

        case "center": {
            const _minX = Math.min(...(nodes || []).map((n) => n?.position.x));
            const _maxX = Math.max(...(nodes || []).map((n) => n?.position.x + (n?.width ?? 0)));
            const centerPosX = (_minX + _maxX) / 2;
            _nodes = (nodes || []).map((n) => {
                return {
                    ...n,
                    position: {
                        x: centerPosX - (n?.width ?? 0) / 2,
                        y: n?.position.y,
                    },
                };
            });
            break;
        }

        case "right": {
            const maxPosX = Math.max(...(nodes || []).map((n) => n?.position.x + (n?.width ?? 0)));
            _nodes = (nodes || []).map((n) => {
                return {
                    ...n,
                    position: {
                        x: maxPosX - (n?.width ?? 0),
                        y: n?.position.y,
                    },
                };
            });
            break;
        }

        case "bottom": {
            const maxPosY = Math.max(...(nodes || []).map((n) => n?.position.y + (n?.height ?? 0)));
            _nodes = (nodes || []).map((n) => {
                return {
                    ...n,
                    position: {
                        x: n?.position.x,
                        y: maxPosY - (n?.height ?? 0),
                    },
                };
            });
            break;
        }

        case "middle": {
            const _minY = Math.min(...(nodes || []).map((n) => n?.position.y));
            const _maxY = Math.max(...(nodes || []).map((n) => n?.position.y + (n?.height ?? 0)));
            const middlePosY = (_minY + _maxY) / 2;
            _nodes = (nodes || []).map((n) => {
                return {
                    ...n,
                    position: {
                        x: n?.position.x,
                        y: middlePosY - (n?.height ?? 0) / 2,
                    },
                };
            });
            break;
        }

        case "top": {
            const minPosY = Math.min(...(nodes || []).map((n) => n?.position.y));
            _nodes = (nodes || []).map((n) => {
                return {
                    ...n,
                    position: {
                        x: n?.position.x, //
                        y: minPosY,
                    },
                };
            });
            break;
        }
    }
    return _nodes;
};

export const getDistributedNodes = ({
    nodes, //
    direction,
}: {
    nodes: DiagramNode[];
    direction: NodeSpacingDirection;
}) => {
    let _selectedNodes = [] as DiagramNode[];
    switch (direction) {
        case "horizontal": {
            const minPosX = Math.min(...(nodes || []).map((n) => n?.position.x));
            const maxPosX = Math.max(...(nodes || []).map((n) => n?.position.x + (n?.width || 0)));
            const totalWidth = maxPosX - minPosX;
            const totalNodeWidth = (nodes || [])
                .map((n) => n?.width || 0)
                .reduce((sum, curr) => sum + curr, 0);
            const gapWidth = (totalWidth - totalNodeWidth) / ((nodes || []).length - 1);

            _selectedNodes = [...(nodes || [])].sort((a, b) => a?.position.x - b?.position.x);
            _selectedNodes.forEach((n, index) => {
                if (index === 0) return;
                n.position = {
                    x:
                        (_selectedNodes[index - 1]?.position?.x ?? 0) +
                        (_selectedNodes[index - 1]?.width || 0) +
                        gapWidth,
                    y: n?.position.y,
                };
            });
            break;
        }

        case "vertical": {
            const minPosY = Math.min(...(nodes || []).map((n) => n?.position.y));
            const maxPosY = Math.max(...(nodes || []).map((n) => n?.position.y + (n?.height || 0)));
            const totalHeight = maxPosY - minPosY;
            const totalNodeHeight =
                (nodes || [])
                    .map((n) => {
                        return n?.height || 0;
                    })
                    .reduce((sum, curr) => sum + curr, 0) ?? 0;
            const gapHeight = (totalHeight - totalNodeHeight) / ((nodes || []).length - 1);

            _selectedNodes = [...(nodes || [])].sort((a, b) => a?.position.y - b?.position.y);
            _selectedNodes.forEach((n, index) => {
                if (index === 0) return;
                n.position = {
                    x: n?.position.x,
                    y:
                        (_selectedNodes[index - 1]?.position?.y ?? 0) +
                        (_selectedNodes[index - 1]?.height || 0) +
                        gapHeight,
                };
            });
            break;
        }
    }
    return _selectedNodes;
};

export const handleAlignment = ({
    instanceId,
    direction,
    handleSetProcessedNodes,
    appendCanvasHistory,
    getViewport,
}: {
    instanceId: string;
    direction: NodeAlignmentDirection;
    handleSetProcessedNodes: (props: {
        canvasNodes: DiagramNode[];
        architectureNodes?: DiagramNode[];
        filterAuthorizedNodes?: boolean;
        filterSelectedViewNodes?: boolean;
        funcRef?: string;
        skipRefreshNodeHandleEdgeMappingList?: boolean;
    }) => DiagramNode[];
    appendCanvasHistory: (selectedCanvas: DiagramCanvas) => void;
    getViewport?: () => Viewport;
}) => {
    const { selectedNodes } = getSelectedNodesFromStore(instanceId);
    const selectedNodeIdList = getDiagramSelectedNodeIdListFromStore(instanceId);
    if (!selectedNodes?.length || selectedNodes?.length < 2) return;

    // Disallow alignment if items do not belong to the same parent
    const hasSameParent = selectedNodes
        ?.map((n) => n?.parentId)
        .every((val, _, arr) => val === arr[0]);
    if (!hasSameParent) {
        enqueueSnackbar("Selected nodes do not belong to the same Parent.", {
            variant: "error",
        });
        return;
    }

    const _selectedNodes = getAlignedNodes({
        nodes: selectedNodes, //
        direction,
    });

    const draftCanvasNodes = getDiagramDraftCanvasFromStore(instanceId)?.nodes ?? [];
    const selectedCanvasNodes = draftCanvasNodes.map((n) => {
        if (!selectedNodeIdList.includes(n.id)) {
            return { ...n };
        }
        const _node = _selectedNodes.find((sn) => {
            return sn.id === n.id;
        });
        return {
            ...n, //
            ..._node,
        };
    });

    handleSetProcessedNodes({
        canvasNodes: selectedCanvasNodes, //
        funcRef: "handleAlignment",
    });
    void updateCanvas({
        instanceId,
        canvasNodes: selectedCanvasNodes,
        funcRef: "handleAlignment",
        ...(getViewport?.() && {
            viewport: getViewport(),
        }),
    }).then((updatedCanvas) => {
        if (updatedCanvas) {
            appendCanvasHistory(updatedCanvas);
        }
    });
};

export const handleDistributeSpacing = ({
    instanceId,
    direction,
    handleSetProcessedNodes,
    appendCanvasHistory,
    getViewport,
}: {
    instanceId: string;
    direction: NodeSpacingDirection;
    handleSetProcessedNodes: (props: {
        canvasNodes: DiagramNode[];
        architectureNodes?: DiagramNode[];
        filterAuthorizedNodes?: boolean;
        filterSelectedViewNodes?: boolean;
        funcRef?: string;
        skipRefreshNodeHandleEdgeMappingList?: boolean;
    }) => DiagramNode[];
    appendCanvasHistory: (selectedCanvas: DiagramCanvas) => void;
    getViewport?: () => Viewport;
}) => {
    const { selectedNodes } = getSelectedNodesFromStore(instanceId);
    const selectedNodeIdList = getDiagramSelectedNodeIdListFromStore(instanceId);
    if (!selectedNodes?.length || selectedNodes?.length < 2) return;

    // Disallow alignment if items do not belong to the same parent
    const hasSameParent = selectedNodes
        ?.map((n) => n?.parentId)
        .every((val, _, arr) => val === arr[0]);
    if (!hasSameParent) {
        enqueueSnackbar("Selected nodes do not belong to the same Parent.", {
            variant: "error",
        });
        return;
    }

    const _selectedNodes = getDistributedNodes({
        nodes: selectedNodes, //
        direction,
    });
    const draftCanvasNodes = getDiagramDraftCanvasFromStore(instanceId)?.nodes ?? [];
    const selectedCanvasNodes = draftCanvasNodes.map((n) => {
        if (!selectedNodeIdList.includes(n.id)) {
            return { ...n };
        }
        const _node = _selectedNodes.find((sn) => {
            return sn.id === n.id;
        });
        return {
            ...n, //
            ..._node,
        };
    });

    handleSetProcessedNodes({
        canvasNodes: selectedCanvasNodes, //
        funcRef: "handleDistributeSpacing",
    });
    void updateCanvas({
        instanceId,
        canvasNodes: selectedCanvasNodes,
        funcRef: "handleDistributeSpacing",
        ...(getViewport?.() && {
            viewport: getViewport(),
        }),
    }).then((updatedCanvas) => {
        if (updatedCanvas) {
            appendCanvasHistory(updatedCanvas);
        }
    });
};
