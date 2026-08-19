import React from "react";

import { enqueueSnackbar } from "notistack";

import { useDiagramInstanceId } from "#root/contexts/DiagramInstanceContext";
import {
    useAppendCanvasHistory,
    useDiagramDraftCanvasType,
    useHandleSetProcessedNodesAndEdges,
} from "#root/hooks/diagram";
import {
    CanvasNodeType,
    CanvasType,
    DiagramEdge,
    DiagramNode,
    UserStoryCardRefEnum,
} from "#root/interfaces/diagram";
import { DialogConfirmStateEnum } from "#root/interfaces/dialog";
import { handleOpenDialog } from "#root/stores/dialogStore";
import {
    getDiagramDraftCanvasEdgesFromStore,
    getDiagramDraftCanvasFromStore,
    getDiagramDraftCanvasNodesFromStore,
} from "#root/stores/projectDiagram/canvas";
import {
    getSelectedEdgesFromStore,
    getSelectedNodesFromStore,
} from "#root/stores/projectDiagram/selection";
import { updateCanvas } from "#root/stores/projectDiagramFeaturePersistenceStore";
import {
    getFilteredCanvasNodesOrEdges,
    getUpdatedNodesAndEdgesAfterPasteOp,
} from "#root/utils/diagram";

const diagramClipboardMapping: Record<
    string,
    {
        nodes: DiagramNode[];
        edges: DiagramEdge[];
    }
> = {};

export const useHandleDeleteSelectedItems = () => {
    const instanceId = useDiagramInstanceId();

    const handleDeleteItems = React.useCallback(
        ({
            nodes: propsNodes,
            edges: propsEdges,
        }: {
            nodes?: DiagramNode[];
            edges?: DiagramEdge[];
        }) => {
            if (!propsNodes?.length && !propsEdges?.length) return;
            handleOpenDialog(DialogConfirmStateEnum.confirmDeleteNodesAndEdges);
        },
        []
    );

    const handleDeleteSelectedItems = React.useCallback(() => {
        const { selectedNodes } = getSelectedNodesFromStore(instanceId);
        const { selectedEdges } = getSelectedEdgesFromStore(instanceId);

        if (!selectedNodes?.length && !selectedEdges?.length) return;
        if (selectedNodes.some((node) => !node?.deletable)) {
            enqueueSnackbar("Node is not deletable.", {
                variant: "error",
            });
            return;
        }

        handleDeleteItems({
            nodes: selectedNodes,
            edges: selectedEdges,
        });
    }, [handleDeleteItems, instanceId]);

    return React.useMemo(
        () => ({
            handleDeleteItems,
            handleDeleteSelectedItems,
        }),
        [handleDeleteItems, handleDeleteSelectedItems]
    );
};

export const useDiagramClipboardCopyAction = () => {
    const instanceId = useDiagramInstanceId();
    const selectedCanvasType = useDiagramDraftCanvasType();

    return React.useCallback(async () => {
        if (!selectedCanvasType) return;

        const { selectedNodes } = getSelectedNodesFromStore(instanceId);
        const { selectedEdges } = getSelectedEdgesFromStore(instanceId);

        if (selectedCanvasType !== CanvasType.architecture) {
            enqueueSnackbar(
                "The Copy action can only be performed while in the Architecture canvas.",
                {
                    variant: "error",
                }
            );
            return;
        }

        if (selectedNodes.some((node) => node?.data?.type === CanvasNodeType.data_flow)) {
            enqueueSnackbar("The Copy action can only be performed on Architecture node.", {
                variant: "error",
            });
            return;
        }

        if (
            selectedNodes.some(
                (node) =>
                    node?.data?.cardRefKey === UserStoryCardRefEnum.card_devices ||
                    node?.data?.cardRefKey === UserStoryCardRefEnum.card_interface
            )
        ) {
            enqueueSnackbar("User Story node cannot be copied.", {
                variant: "error",
            });
            return;
        }

        if (!selectedNodes.length && selectedEdges.length) {
            enqueueSnackbar("Edges cannot be copied without their connected nodes.", {
                variant: "error",
            });
            return;
        }

        diagramClipboardMapping[instanceId] = {
            nodes: selectedNodes,
            edges: selectedEdges.filter((edge) => {
                const selectedNodeIdSet = new Set(selectedNodes.map((node) => node.id));
                return selectedNodeIdSet.has(edge.source) && selectedNodeIdSet.has(edge.target);
            }),
        };
    }, [instanceId, selectedCanvasType]);
};

export const useDiagramClipboardPasteAction = () => {
    const instanceId = useDiagramInstanceId();
    const appendCanvasHistory = useAppendCanvasHistory();
    const selectedCanvasType = useDiagramDraftCanvasType();
    const handleSetProcessedNodesAndEdges = useHandleSetProcessedNodesAndEdges();

    return React.useCallback(async () => {
        try {
            const selectedCanvas = getDiagramDraftCanvasFromStore(instanceId);
            const contextNodes = getDiagramDraftCanvasNodesFromStore(instanceId);
            const contextEdges = getDiagramDraftCanvasEdgesFromStore(instanceId);
            const clipboard = diagramClipboardMapping[instanceId] ?? {
                nodes: [],
                edges: [],
            };

            if (!selectedCanvas || !selectedCanvasType) return;

            const canvasNodes = getFilteredCanvasNodesOrEdges<DiagramNode>(
                contextNodes,
                selectedCanvasType
            );
            const canvasEdges = getFilteredCanvasNodesOrEdges<DiagramEdge>(
                contextEdges,
                selectedCanvasType
            );

            const updated = getUpdatedNodesAndEdgesAfterPasteOp({
                clipboard,
                canvasNodes,
                canvasEdges,
                selectedCanvasType,
                allNodes: contextNodes,
            });

            const nextSelectedCanvas = await updateCanvas({
                instanceId,
                canvasNodes: updated.canvasNodes,
                canvasEdges: updated.canvasEdges,
            });
            if (nextSelectedCanvas) {
                appendCanvasHistory(nextSelectedCanvas);
            }
            await handleSetProcessedNodesAndEdges({
                canvasEdges: updated.canvasEdges,
                canvasNodes: updated.canvasNodes,
                funcRef: "handlePaste",
            });
        } catch (error) {
            enqueueSnackbar(`Operation failed. ${error}`, { variant: "error" });
        }
    }, [appendCanvasHistory, handleSetProcessedNodesAndEdges, instanceId, selectedCanvasType]);
};
