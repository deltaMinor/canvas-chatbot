import React, { PropsWithChildren } from "react";

import FullscreenIcon from "@mui/icons-material/Fullscreen";
import RedoIcon from "@mui/icons-material/Redo";
import UndoIcon from "@mui/icons-material/Undo";
import { ControlButton, ControlProps, Controls, useReactFlow } from "@xyflow/react";

import { useCanvasRedo, useCanvasUndo, useDiagramCapabilitiesState } from "#root/hooks/diagram";
import { DiagramEdge, DiagramNode } from "#root/interfaces/diagram";

const NO_BOTTOM_BORDER_CLASSNAME = "!border-b-0";

interface DiagramControlsProps extends PropsWithChildren<ControlProps> {}

const DiagramControlsComponent = ({ ...props }: DiagramControlsProps) => {
    const capabilities = useDiagramCapabilitiesState();
    const canvasUndo = useCanvasUndo();
    const canvasRedo = useCanvasRedo();
    const reactFlow = useReactFlow<DiagramNode, DiagramEdge>();

    const handleFitView = React.useCallback(() => {
        reactFlow.fitView({ maxZoom: 1 });
    }, [reactFlow]);

    return (
        <Controls
            position="top-right"
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
        </Controls>
    );
};

export default React.memo(DiagramControlsComponent);
