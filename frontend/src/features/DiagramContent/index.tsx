import React from "react";

import { Box } from "@mui/material";

import DiagramCanvasOrchestrator from "./DiagramCanvasOrchestrator";

import "@xyflow/react/dist/style.css";

const DiagramContentComponent = () => {
    return (
        <Box className="absolute inset-0 overflow-hidden">
            <DiagramCanvasOrchestrator />
        </Box>
    );
};

export default React.memo(DiagramContentComponent);
