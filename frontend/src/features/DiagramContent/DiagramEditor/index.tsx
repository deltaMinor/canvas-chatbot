import React from "react";

import { Stack } from "@mui/material";

import DiagramCanvasBackdrops from "#root/components/DiagramCanvasBackdrops";
import DiagramCanvasBoxWrapper from "#root/components/DiagramCanvasBoxWrapper";

import DiagramCanvasDialogConfirm from "./DiagramCanvasDialogConfirm";
import DiagramEditorCanvasBody from "./DiagramEditorCanvasBody";
import DiagramEditorChatbot from "./DiagramEditorChatbot";

const DiagramEditorComponent = () => {
    return (
        <Stack className="diagram-canvas-root">
            <DiagramCanvasDialogConfirm />
            {/* <DiagramLockedCQDialog /> */}
            <Stack direction="row" className="diagram-canvas-row">
                <DiagramEditorChatbot />
                <DiagramCanvasBoxWrapper>
                    <DiagramEditorCanvasBody />
                    <DiagramCanvasBackdrops />
                </DiagramCanvasBoxWrapper>
            </Stack>
        </Stack>
    );
};

export default React.memo(DiagramEditorComponent);
