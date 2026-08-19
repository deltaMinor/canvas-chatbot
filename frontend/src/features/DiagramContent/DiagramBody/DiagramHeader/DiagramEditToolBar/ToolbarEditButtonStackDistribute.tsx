import React from "react";

import ViewDayOutlinedIcon from "@mui/icons-material/ViewDayOutlined";
import { Stack } from "@mui/material";
import { useReactFlow } from "@xyflow/react";

import { DiagramToolbarButton } from "#root/components/DiagramToolbarPrimitives";
import { useDiagramInstanceId } from "#root/contexts/DiagramInstanceContext";
import {
    useAppendCanvasHistory,
    useDiagramCapabilitiesState,
    useHandleSetProcessedNodes,
} from "#root/hooks/diagram";
import { DiagramEdge, DiagramNode, NodeSpacingDirection } from "#root/interfaces/diagram";
import { DiagramEditToolbarState } from "#root/redux/projectDiagramFeatureSlice";

import { handleDistributeSpacing } from "./helper";

interface ToolbarEditButtonStackDistributeProps {
    editState: DiagramEditToolbarState;
}

const ToolbarEditButtonStackDistributeComponent = ({
    editState,
}: ToolbarEditButtonStackDistributeProps) => {
    const capabilities = useDiagramCapabilitiesState();
    const instanceId = useDiagramInstanceId();
    const reactFlow = useReactFlow<DiagramNode, DiagramEdge>();
    const appendCanvasHistory = useAppendCanvasHistory();
    const handleSetProcessedNodes = useHandleSetProcessedNodes();

    const handleClickDistributeSpacing = React.useCallback(
        async (direction: NodeSpacingDirection) => {
            return handleDistributeSpacing({
                instanceId,
                direction,
                handleSetProcessedNodes,
                appendCanvasHistory,
                getViewport: reactFlow.getViewport,
            });
        },
        [appendCanvasHistory, handleSetProcessedNodes, instanceId, reactFlow]
    );

    return (
        <Stack direction="row">
            <DiagramToolbarButton
                className=""
                disabled={!editState["distribution"] || !capabilities.toolbar.editToolbar.enabled}
                onClick={() => handleClickDistributeSpacing("horizontal")}
                size="small"
                startIcon={<ViewDayOutlinedIcon sx={{ rotate: "90deg" }} />}
                tooltipProps={{ title: "Distribute Horizontally" }}
            />
            <DiagramToolbarButton
                className=""
                disabled={!editState["distribution"] || !capabilities.toolbar.editToolbar.enabled}
                onClick={() => handleClickDistributeSpacing("vertical")}
                size="small"
                startIcon={<ViewDayOutlinedIcon />}
                tooltipProps={{ title: "Distribute Vertically" }}
            />
        </Stack>
    );
};

export default React.memo(ToolbarEditButtonStackDistributeComponent);
