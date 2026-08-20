import React from "react";

import AlignHorizontalCenterIcon from "@mui/icons-material/AlignHorizontalCenter";
import AlignHorizontalLeftIcon from "@mui/icons-material/AlignHorizontalLeft";
import AlignHorizontalRightIcon from "@mui/icons-material/AlignHorizontalRight";
import { Stack } from "@mui/material";
import { useReactFlow } from "@xyflow/react";

import DiagramToolbarButton from "#root/components/DiagramToolbarPrimitives/DiagramToolbarButton";
import { useDiagramInstanceId } from "#root/contexts/DiagramInstanceContext";
import {
    useAppendCanvasHistory,
    useDiagramCapabilitiesState,
    useHandleSetProcessedNodes,
} from "#root/hooks/diagram";
import { DiagramEdge, DiagramNode } from "#root/interfaces/diagram";
import { DiagramEditToolbarState } from "#root/redux/projectDiagramFeatureSlice";

import { handleAlignment } from "./helper";

interface ToolbarEditButtonStackArrangeXProps {
    editState: DiagramEditToolbarState;
}

const ToolbarEditButtonStackArrangeXComponent = ({
    editState,
}: ToolbarEditButtonStackArrangeXProps) => {
    const capabilities = useDiagramCapabilitiesState();
    const instanceId = useDiagramInstanceId();
    const reactFlow = useReactFlow<DiagramNode, DiagramEdge>();
    const appendCanvasHistory = useAppendCanvasHistory();
    const handleSetProcessedNodes = useHandleSetProcessedNodes();

    const handleClickAlignLeft = () => {
        handleAlignment({
            instanceId,
            direction: "left",
            handleSetProcessedNodes,
            appendCanvasHistory,
            getViewport: reactFlow.getViewport,
        });
    };
    const handleClickAlignCenter = () => {
        handleAlignment({
            instanceId,
            direction: "center",
            handleSetProcessedNodes,
            appendCanvasHistory,
            getViewport: reactFlow.getViewport,
        });
    };
    const handleClickAlignRight = () => {
        handleAlignment({
            instanceId,
            direction: "right",
            handleSetProcessedNodes,
            appendCanvasHistory,
            getViewport: reactFlow.getViewport,
        });
    };
    return (
        <Stack direction="row">
            <DiagramToolbarButton
                tooltipProps={{ title: "Align Left" }}
                onClick={handleClickAlignLeft}
                disabled={!editState["alignment"] || !capabilities.toolbar.editToolbar.enabled}
                className=""
                startIcon={<AlignHorizontalLeftIcon />}
                size="small"
            />
            <DiagramToolbarButton
                tooltipProps={{ title: "Align Center" }}
                onClick={handleClickAlignCenter}
                disabled={!editState["alignment"] || !capabilities.toolbar.editToolbar.enabled}
                className=""
                startIcon={<AlignHorizontalCenterIcon />}
                size="small"
            />
            <DiagramToolbarButton
                tooltipProps={{ title: "Align Right" }}
                onClick={handleClickAlignRight}
                disabled={!editState["alignment"] || !capabilities.toolbar.editToolbar.enabled}
                className=""
                startIcon={<AlignHorizontalRightIcon />}
                size="small"
            />
        </Stack>
    );
};

export default React.memo(ToolbarEditButtonStackArrangeXComponent);
