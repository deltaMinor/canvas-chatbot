import React, { PropsWithChildren } from "react";

import AutoFixHigh from "@mui/icons-material/AutoFixHigh";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import RedoIcon from "@mui/icons-material/Redo";
import UndoIcon from "@mui/icons-material/Undo";
import { ControlButton, ControlProps, Controls, useReactFlow } from "@xyflow/react";
import { enqueueSnackbar } from "notistack";

import MuiMenu from "#root/components/MuiMenu";
import MuiMenuItem from "#root/components/MuiMenuItem";
import { useDiagramInstanceId } from "#root/contexts/DiagramInstanceContext";
import {
    useAppendCanvasHistory,
    useCanvasRedo,
    useCanvasUndo,
    useDiagramCapabilitiesState,
    useHandleSetProcessedNodesAndEdges,
} from "#root/hooks/diagram";
import { DiagramEdge, DiagramNode } from "#root/interfaces/diagram";
import {
    getDiagramDraftCanvasEdgesFromStore,
    getDiagramDraftCanvasNodesFromStore,
} from "#root/stores/projectDiagram/canvas";
import { updateCanvas } from "#root/stores/projectDiagramFeaturePersistenceStore";
import { getRealignedEdgeHandles } from "#root/utils/diagram/diagramEdgeHandleRealignUtil";
import { resolveDiagramLayoutOverlaps } from "#root/utils/diagram/diagramLayoutOverlapResolver";

const NO_BOTTOM_BORDER_CLASSNAME = "!border-b-0";

interface DiagramControlsProps extends PropsWithChildren<ControlProps> {}

const DiagramControlsComponent = ({ ...props }: DiagramControlsProps) => {
    const instanceId = useDiagramInstanceId();
    const capabilities = useDiagramCapabilitiesState();
    const canvasUndo = useCanvasUndo();
    const canvasRedo = useCanvasRedo();
    const appendCanvasHistory = useAppendCanvasHistory();
    const handleSetProcessedNodesAndEdges = useHandleSetProcessedNodesAndEdges();
    const reactFlow = useReactFlow<DiagramNode, DiagramEdge>();

    const [layoutMenuAnchorEl, setLayoutMenuAnchorEl] = React.useState<null | HTMLElement>(null);
    const isLayoutMenuOpen = Boolean(layoutMenuAnchorEl);

    const isEditingDisabled = !capabilities.toolbar.editToolbar.enabled;

    const handleFitView = React.useCallback(() => {
        reactFlow.fitView({ maxZoom: 1 });
    }, [reactFlow]);

    const handleOpenLayoutMenu = React.useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
        setLayoutMenuAnchorEl(event.currentTarget);
    }, []);

    const handleCloseLayoutMenu = React.useCallback(() => {
        setLayoutMenuAnchorEl(null);
    }, []);

    const handleRealignEdges = React.useCallback(async () => {
        try {
            const canvasNodes = getDiagramDraftCanvasNodesFromStore(instanceId);
            const canvasEdges = getDiagramDraftCanvasEdgesFromStore(instanceId);
            if (!canvasNodes?.length || !canvasEdges?.length) return;

            const nextEdges = getRealignedEdgeHandles(canvasNodes, canvasEdges);

            const nextSelectedCanvas = await updateCanvas({
                instanceId,
                canvasEdges: nextEdges,
            });
            if (nextSelectedCanvas) {
                appendCanvasHistory(nextSelectedCanvas);
            }

            await handleSetProcessedNodesAndEdges({
                canvasNodes,
                canvasEdges: nextEdges,
                funcRef: "handleRealignEdges",
            });
        } catch (error) {
            enqueueSnackbar(`Failed to realign edges. ${error}`, { variant: "error" });
        }
    }, [appendCanvasHistory, handleSetProcessedNodesAndEdges, instanceId]);

    const handleReorganiseNodes = React.useCallback(async () => {
        try {
            const canvasNodes = getDiagramDraftCanvasNodesFromStore(instanceId);
            const canvasEdges = getDiagramDraftCanvasEdgesFromStore(instanceId);
            if (!canvasNodes?.length || !canvasEdges?.length) return;

            const resolved = resolveDiagramLayoutOverlaps(canvasNodes, canvasEdges);

            const nextSelectedCanvas = await updateCanvas({
                instanceId,
                canvasNodes: resolved.nodes,
                canvasEdges: resolved.edges,
            });
            if (nextSelectedCanvas) {
                appendCanvasHistory(nextSelectedCanvas);
            }

            await handleSetProcessedNodesAndEdges({
                canvasNodes: resolved.nodes,
                canvasEdges: resolved.edges,
                funcRef: "handleReorganiseNodes",
            });
        } catch (error) {
            enqueueSnackbar(`Failed to reorganise nodes. ${error}`, { variant: "error" });
        }
    }, [appendCanvasHistory, handleSetProcessedNodesAndEdges, instanceId]);

    const handleSelectRealignEdges = React.useCallback(() => {
        handleCloseLayoutMenu();
        handleRealignEdges();
    }, [handleCloseLayoutMenu, handleRealignEdges]);

    const handleSelectReorganiseNodes = React.useCallback(() => {
        handleCloseLayoutMenu();
        handleReorganiseNodes();
    }, [handleCloseLayoutMenu, handleReorganiseNodes]);

    return (
        <Controls
            position="top-left"
            showZoom={false}
            showFitView={false}
            showInteractive={false}
            {...props}
        >
            <div className="flex flex-row items-center gap-1">
                <ControlButton
                    onClick={handleFitView}
                    title="Fit View"
                    className={NO_BOTTOM_BORDER_CLASSNAME}
                >
                    <FullscreenIcon />
                </ControlButton>
            </div>
            <ControlButton
                disabled={!capabilities.toolbar.undo.enabled}
                onClick={canvasUndo}
                title="Undo"
            >
                <UndoIcon />
            </ControlButton>
            <ControlButton
                disabled={!capabilities.toolbar.redo.enabled}
                onClick={canvasRedo}
                title="Redo"
            >
                <RedoIcon />
            </ControlButton>
            <ControlButton
                disabled={isEditingDisabled}
                onClick={handleOpenLayoutMenu}
                title="Autofix Layout"
            >
                <AutoFixHigh />
            </ControlButton>
            <MuiMenu
                anchorEl={layoutMenuAnchorEl}
                open={isLayoutMenuOpen}
                onClose={handleCloseLayoutMenu}
            >
                <MuiMenuItem onClick={handleSelectRealignEdges}>Realign Edges</MuiMenuItem>
                <MuiMenuItem onClick={handleSelectReorganiseNodes}>Reorganise Nodes</MuiMenuItem>
            </MuiMenu>
        </Controls>
    );
};

export default React.memo(DiagramControlsComponent);
