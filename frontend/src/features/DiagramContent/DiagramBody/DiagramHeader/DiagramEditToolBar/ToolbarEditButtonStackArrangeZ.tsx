import React from "react";

import FirstPageIcon from "@mui/icons-material/FirstPage";
import LastPageIcon from "@mui/icons-material/LastPage";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { Stack } from "@mui/material";

import DiagramToolbarButton from "#root/components/DiagramToolbarPrimitives/DiagramToolbarButton";
import { useDiagramInstanceId } from "#root/contexts/DiagramInstanceContext";
import {
    useAppendCanvasHistory,
    useDiagramCapabilitiesState,
    useHandleSetProcessedNodes,
} from "#root/hooks/diagram";
import { DiagramNode } from "#root/interfaces/diagram";
import { DiagramEditToolbarState } from "#root/redux/projectDiagramFeatureSlice";
import { getDiagramDraftCanvasFromStore } from "#root/stores/projectDiagram/canvas";
import {
    getDiagramSelectedNodeIdListFromStore,
    getSelectedNodesFromStore,
} from "#root/stores/projectDiagram/selection";
import { updateCanvas } from "#root/stores/projectDiagramFeaturePersistenceStore";

interface ToolbarEditButtonStackArrangeZProps {
    editState: DiagramEditToolbarState;
}

const ToolbarEditButtonStackArrangeZComponent = ({
    editState,
}: ToolbarEditButtonStackArrangeZProps) => {
    const capabilities = useDiagramCapabilitiesState();
    const instanceId = useDiagramInstanceId();
    const appendCanvasHistory = useAppendCanvasHistory();
    const handleSetProcessedNodes = useHandleSetProcessedNodes();
    /* Notes on Layering
     * - The render order of Nodes is first determined by their z-index, then their DOM order.
     * - All Nodes have a default z-index of 1.
     * - The Layering algorithms below utilizes the DOM order to determine their layering.
     * - All Edges have a default z-index of 100, and are hence rendered above Nodes. This is so that Edges remain clickable even after being placed into a Cluster.
     */
    const handleSendToBack = React.useCallback(async () => {
        const { selectedNodes } = getSelectedNodesFromStore(instanceId);
        const selectedNodeIdList = getDiagramSelectedNodeIdListFromStore(instanceId);
        if (!selectedNodes?.length) return;

        const draftCanvasNodes = getDiagramDraftCanvasFromStore(instanceId)?.nodes ?? [];
        const deselectedNodes = draftCanvasNodes.filter((n) => {
            return !selectedNodeIdList?.includes(n.id);
        });
        const selectedCanvasNodes = [
            ...selectedNodes, //
            ...deselectedNodes,
        ];

        handleSetProcessedNodes({
            canvasNodes: selectedCanvasNodes, //
            funcRef: "handleSendToBack",
        });
        const nextSelectedCanvas = await updateCanvas({
            instanceId,
            canvasNodes: selectedCanvasNodes,
        });
        if (nextSelectedCanvas) {
            appendCanvasHistory(nextSelectedCanvas);
        }
    }, [appendCanvasHistory, handleSetProcessedNodes, instanceId]);

    const handleBringToFront = React.useCallback(async () => {
        const { selectedNodes } = getSelectedNodesFromStore(instanceId);
        const selectedNodeIdList = getDiagramSelectedNodeIdListFromStore(instanceId);
        if (!selectedNodes?.length) return;

        const draftCanvasNodes = getDiagramDraftCanvasFromStore(instanceId)?.nodes ?? [];
        const deselectedNodes = draftCanvasNodes.filter((n) => {
            return !selectedNodeIdList?.includes(n.id);
        });
        const selectedCanvasNodes = [
            ...deselectedNodes, //
            ...selectedNodes,
        ];

        handleSetProcessedNodes({
            canvasNodes: selectedCanvasNodes, //
            funcRef: "handleBringToFront",
        });
        const nextSelectedCanvas = await updateCanvas({
            instanceId,
            canvasNodes: selectedCanvasNodes,
        });
        if (nextSelectedCanvas) {
            appendCanvasHistory(nextSelectedCanvas);
        }
    }, [appendCanvasHistory, handleSetProcessedNodes, instanceId]);

    const handleSendBackward = React.useCallback(async () => {
        const { selectedNodes } = getSelectedNodesFromStore(instanceId);
        const selectedNodeIdList = getDiagramSelectedNodeIdListFromStore(instanceId);
        if (!selectedNodes?.length) return;

        const draftCanvasNodes = getDiagramDraftCanvasFromStore(instanceId)?.nodes ?? [];
        const selectedCanvasNodeIndexMapping = draftCanvasNodes.reduce(
            (acc, n: DiagramNode, nIdx: number) => {
                acc[nIdx] = n;
                return acc;
            },
            {} as { [key: number]: DiagramNode | undefined }
        );
        draftCanvasNodes.forEach((n, nIdx) => {
            if (!selectedNodeIdList?.includes(n.id)) {
                return;
            }
            if (nIdx === 0) return;
            selectedCanvasNodeIndexMapping[nIdx] = selectedCanvasNodeIndexMapping[nIdx - 1];
            selectedCanvasNodeIndexMapping[nIdx - 1] = n;
        });

        const selectedCanvasNodes = [] as DiagramNode[];
        for (let i = 0; i < draftCanvasNodes.length; i++) {
            const node = selectedCanvasNodeIndexMapping[i];
            if (node) {
                selectedCanvasNodes.push(node);
            }
        }

        handleSetProcessedNodes({
            canvasNodes: selectedCanvasNodes, //
            funcRef: "handleSendBackward",
        });
        const nextSelectedCanvas = await updateCanvas({
            instanceId,
            canvasNodes: selectedCanvasNodes,
        });
        if (nextSelectedCanvas) {
            appendCanvasHistory(nextSelectedCanvas);
        }
    }, [appendCanvasHistory, handleSetProcessedNodes, instanceId]);

    const handleBringForward = React.useCallback(async () => {
        const { selectedNodes } = getSelectedNodesFromStore(instanceId);
        const selectedNodeIdList = getDiagramSelectedNodeIdListFromStore(instanceId);
        if (!selectedNodes?.length) return;

        const draftCanvasNodes = getDiagramDraftCanvasFromStore(instanceId)?.nodes ?? [];
        const selectedCanvasNodeIndexMapping = draftCanvasNodes.reduce(
            (acc, n: DiagramNode, nIdx: number) => {
                acc[nIdx] = n;
                return acc;
            },
            {} as { [key: number]: DiagramNode | undefined }
        );
        draftCanvasNodes.forEach((n, nIdx) => {
            if (!selectedNodeIdList?.includes(n.id)) {
                return;
            }
            if (nIdx === draftCanvasNodes.length - 1) return;
            selectedCanvasNodeIndexMapping[nIdx] = selectedCanvasNodeIndexMapping[nIdx + 1];
            selectedCanvasNodeIndexMapping[nIdx + 1] = n;
        });

        const selectedCanvasNodes = [] as DiagramNode[];
        for (let i = 0; i < draftCanvasNodes.length; i++) {
            const node = selectedCanvasNodeIndexMapping[i];
            if (node) {
                selectedCanvasNodes.push(node);
            }
        }

        handleSetProcessedNodes({
            canvasNodes: selectedCanvasNodes, //
            funcRef: "handleBringForward",
        });
        const nextSelectedCanvas = await updateCanvas({
            instanceId,
            canvasNodes: selectedCanvasNodes,
        });
        if (nextSelectedCanvas) {
            appendCanvasHistory(nextSelectedCanvas);
        }
    }, [appendCanvasHistory, handleSetProcessedNodes, instanceId]);

    return (
        <Stack direction="row">
            <DiagramToolbarButton
                className=""
                disabled={!editState["layering"] || !capabilities.toolbar.editToolbar.enabled}
                onClick={handleSendToBack}
                size="small"
                startIcon={<LastPageIcon sx={{ rotate: "90deg" }} />}
                tooltipProps={{ title: "Send to Back" }}
            />
            <DiagramToolbarButton
                className=""
                disabled={!editState["layering"] || !capabilities.toolbar.editToolbar.enabled}
                onClick={handleSendBackward}
                size="small"
                startIcon={<NavigateNextIcon sx={{ rotate: "90deg" }} />}
                tooltipProps={{ title: "Send Backwards" }}
            />
            <DiagramToolbarButton
                className=""
                disabled={!editState["layering"] || !capabilities.toolbar.editToolbar.enabled}
                onClick={handleBringForward}
                size="small"
                startIcon={<NavigateBeforeIcon sx={{ rotate: "90deg" }} />}
                tooltipProps={{ title: "Bring Forward" }}
            />
            <DiagramToolbarButton
                className=""
                disabled={!editState["layering"] || !capabilities.toolbar.editToolbar.enabled}
                onClick={handleBringToFront}
                size="small"
                startIcon={<FirstPageIcon sx={{ rotate: "90deg" }} />}
                tooltipProps={{ title: "Bring to Front" }}
            />
        </Stack>
    );
};

export default React.memo(ToolbarEditButtonStackArrangeZComponent);
