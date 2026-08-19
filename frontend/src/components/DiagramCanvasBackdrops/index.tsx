import React from "react";

import { Backdrop } from "@mui/material";

import {
    DEFAULT_ZINDEX_CANVAS_BACKDROP,
    DEFAULT_ZINDEX_DIAGRAM_DRAWER,
} from "#root/constants/diagram";
import {
    useDiagramDrawerState,
    useDiagramInTransition,
    useVerifyCloseEdgeDrawer,
    useVerifyCloseNodeDrawer,
} from "#root/hooks/diagram";

const DiagramCanvasBackdropsComponent = () => {
    const inTransition = useDiagramInTransition();
    const drawerState = useDiagramDrawerState();
    const handleVerifyCloseNodeDrawer = useVerifyCloseNodeDrawer();
    const handleVerifyCloseEdgeDrawer = useVerifyCloseEdgeDrawer();

    const openBackdrop = !!inTransition || !!drawerState.node_info || !!drawerState.edge_info;
    const handleClickBackdrop = React.useCallback(() => {
        if (inTransition) {
            return;
        }

        if (drawerState.node_info) {
            handleVerifyCloseNodeDrawer();
            return;
        }

        if (drawerState.edge_info) {
            handleVerifyCloseEdgeDrawer();
        }
    }, [
        drawerState.edge_info,
        drawerState.node_info,
        handleVerifyCloseEdgeDrawer,
        handleVerifyCloseNodeDrawer,
        inTransition,
    ]);

    return (
        <Backdrop
            className="diagram-canvas-backdrop"
            open={openBackdrop}
            onClick={handleClickBackdrop}
            style={{
                zIndex: inTransition
                    ? DEFAULT_ZINDEX_DIAGRAM_DRAWER + 1
                    : Math.max(DEFAULT_ZINDEX_CANVAS_BACKDROP, DEFAULT_ZINDEX_DIAGRAM_DRAWER - 1),
            }}
        />
    );
};

export default React.memo(DiagramCanvasBackdropsComponent);
