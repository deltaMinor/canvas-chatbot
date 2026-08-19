import React from "react";

import CloseIcon from "@mui/icons-material/Close";
import { Stack, Typography } from "@mui/material";

import {
    DiagramToolbarButton,
    DiagramToolbarDivider,
} from "#root/components/DiagramToolbarPrimitives";
import {
    useDeselectAllNodesAndEdges,
    useDiagramEditToolbarState,
    useDiagramIsAttributeDrawerOpen,
} from "#root/hooks/diagram";

import ToolbarEditButtonStackArrangeX from "./ToolbarEditButtonStackArrangeX";
import ToolbarEditButtonStackArrangeY from "./ToolbarEditButtonStackArrangeY";
import ToolbarEditButtonStackArrangeZ from "./ToolbarEditButtonStackArrangeZ";
import ToolbarEditButtonStack from "./ToolbarEditButtonStackCrud";
import ToolbarEditButtonStackDistribute from "./ToolbarEditButtonStackDistribute";

const DiagramEditToolbarComponent = () => {
    const deselectAllNodesAndEdges = useDeselectAllNodesAndEdges();
    const editState = useDiagramEditToolbarState();
    const isAttributeDrawerOpen = useDiagramIsAttributeDrawerOpen();

    const handleCloseEditToolbar = React.useCallback(() => {
        deselectAllNodesAndEdges();
    }, [deselectAllNodesAndEdges]);

    return (
        <Stack
            className="joyride-toolbar-edit"
            direction="row"
            justifyContent="flex-start"
            alignItems="center"
            sx={{
                display: isAttributeDrawerOpen ? "none" : "flex",
            }}
            divider={
                <DiagramToolbarDivider //
                    orientation="vertical"
                    variant="middle"
                    flexItem
                />
            }
        >
            <Typography
                className="px-2"
                variant="h6"
            >
                Edit Toolbar
            </Typography>
            <ToolbarEditButtonStack //
                editState={editState}
            />
            <ToolbarEditButtonStackArrangeZ //
                editState={editState}
            />
            <ToolbarEditButtonStackArrangeX //
                editState={editState}
            />
            <ToolbarEditButtonStackArrangeY //
                editState={editState}
            />
            <ToolbarEditButtonStackDistribute //
                editState={editState}
            />
            <DiagramToolbarButton
                onClick={handleCloseEditToolbar} //
                className=""
                startIcon={<CloseIcon />}
                size="small"
            >
                Close
            </DiagramToolbarButton>
        </Stack>
    );
};

export default React.memo(DiagramEditToolbarComponent);
