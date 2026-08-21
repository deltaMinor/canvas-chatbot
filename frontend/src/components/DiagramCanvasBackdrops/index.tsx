import React from "react";

import { Backdrop } from "@mui/material";

import { DEFAULT_ZINDEX_DIAGRAM_DRAWER } from "#root/constants/diagram";
import { useDiagramInTransition } from "#root/hooks/diagram";

// Note: this backdrop used to also catch outside-clicks to close the
// node/edge attribute drawer. That drawer has been removed along with all
// manual diagram editing, so this now only covers the loading/transition
// state.
const DiagramCanvasBackdropsComponent = () => {
    const inTransition = useDiagramInTransition();

    return (
        <Backdrop
            className="diagram-canvas-backdrop"
            open={!!inTransition}
            style={{
                zIndex: DEFAULT_ZINDEX_DIAGRAM_DRAWER + 1,
            }}
        />
    );
};

export default React.memo(DiagramCanvasBackdropsComponent);
