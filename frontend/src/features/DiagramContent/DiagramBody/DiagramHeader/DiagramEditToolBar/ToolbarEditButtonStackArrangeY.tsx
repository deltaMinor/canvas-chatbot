import React from "react";

import AlignVerticalBottomIcon from "@mui/icons-material/AlignVerticalBottom";
import AlignVerticalCenterIcon from "@mui/icons-material/AlignVerticalCenter";
import AlignVerticalTopIcon from "@mui/icons-material/AlignVerticalTop";
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

interface ToolbarEditButtonStackArrangeYProps {
    editState: DiagramEditToolbarState;
}

const ToolbarEditButtonStackArrangeYComponent = ({
    editState,
}: ToolbarEditButtonStackArrangeYProps) => {
    const capabilities = useDiagramCapabilitiesState();
    const instanceId = useDiagramInstanceId();
    const reactFlow = useReactFlow<DiagramNode, DiagramEdge>();
    const appendCanvasHistory = useAppendCanvasHistory();
    const handleSetProcessedNodes = useHandleSetProcessedNodes();

    const handleClickAlignBottom = () => {
        handleAlignment({
            instanceId,
            direction: "bottom",
            handleSetProcessedNodes,
            appendCanvasHistory,
            getViewport: reactFlow.getViewport,
        });
    };
    const handleClickAlignMiddle = () => {
        handleAlignment({
            instanceId,
            direction: "middle",
            handleSetProcessedNodes,
            appendCanvasHistory,
            getViewport: reactFlow.getViewport,
        });
    };
    const handleClickAlignTop = () => {
        handleAlignment({
            instanceId,
            direction: "top",
            handleSetProcessedNodes,
            appendCanvasHistory,
            getViewport: reactFlow.getViewport,
        });
    };
    return (
        <Stack direction="row">
            <DiagramToolbarButton
                className=""
                disabled={!editState["alignment"] || !capabilities.toolbar.editToolbar.enabled}
                onClick={handleClickAlignBottom}
                size="small"
                startIcon={<AlignVerticalBottomIcon />}
                tooltipProps={{ title: "Align Bottom" }}
            />
            <DiagramToolbarButton
                className=""
                disabled={!editState["alignment"] || !capabilities.toolbar.editToolbar.enabled}
                onClick={handleClickAlignMiddle}
                size="small"
                startIcon={<AlignVerticalCenterIcon />}
                tooltipProps={{ title: "Align Middle" }}
            />
            <DiagramToolbarButton
                className=""
                disabled={!editState["alignment"] || !capabilities.toolbar.editToolbar.enabled}
                onClick={handleClickAlignTop}
                size="small"
                startIcon={<AlignVerticalTopIcon />}
                tooltipProps={{ title: "Align Top" }}
            />
        </Stack>
    );
};

export default React.memo(ToolbarEditButtonStackArrangeYComponent);
