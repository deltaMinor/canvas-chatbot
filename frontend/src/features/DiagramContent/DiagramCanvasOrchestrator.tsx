import React from "react";

import { Box } from "@mui/material";

import DiagramTransitionEffects from "#root/effects/DiagramTransitionEffects";
import { useProjectId } from "#root/hooks/backendHooks";

import DiagramContextBundle from "./DiagramContextBundle";
import DiagramEditorContent from "./DiagramEditorContent";

const DiagramCanvasOrchestratorComponent = () => {
    const projectId = useProjectId();
    const instanceId = React.useMemo(
        () => `${projectId || "project"}-diagram-${crypto.randomUUID()}`,
        [projectId]
    );

    return (
        <Box
            className="h-full w-full"
            sx={{
                position: "relative",
            }}
        >
            <DiagramTransitionEffects />
            <DiagramContextBundle instanceId={instanceId}>
                <DiagramEditorContent />
            </DiagramContextBundle>
        </Box>
    );
};

export default DiagramCanvasOrchestratorComponent;
